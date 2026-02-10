// Generate a cardlink code block from a URL

import { Editor, Notice, requestUrl } from "obsidian";

import { LinkMetadata } from "src/interfaces";
import { EditorExtensions } from "src/editor-enhancements";
import { LinkMetadataParser } from "src/card/metadata-parser";

export class CodeBlockGenerator {
	editor: Editor;

	constructor(editor: Editor) {
		this.editor = editor;
	}

	// Convert the URL into a cardlink code block and insert it into the editor
	async convertUrlToCodeBlock(url: string): Promise<void> {
		const selectedText = this.editor.getSelection();

		// Generate temporary display text (to show that a fetch is in progress)
		const pasteId = this.createBlockHash();
		const fetchingText = `[Fetching Data#${pasteId}](${url})`;

		// First insert placeholder text (replace it once the fetch completes)
		this.editor.replaceSelection(fetchingText);

		const linkMetadata = await this.fetchLinkMetadata(url);

		const text = this.editor.getValue();
		const start = text.indexOf(fetchingText);

		if (start < 0) {
			console.log(
				`Unable to find text "${fetchingText}" in current editor, bailing out; link ${url}`
			);
			return;
		}

		const end = start + fetchingText.length;
		const startPos = EditorExtensions.getEditorPositionFromIndex(text, start);
		const endPos = EditorExtensions.getEditorPositionFromIndex(text, end);

		// Revert to the original text if fetching the metadata fails
		if (!linkMetadata) {
			new Notice("Couldn't fetch link metadata");
			this.editor.replaceRange(selectedText || url, startPos, endPos);
			return;
		}
		this.editor.replaceRange(this.genCodeBlock(linkMetadata), startPos, endPos);
	}

	// Generate the cardlink code block's text from the metadata
	genCodeBlock(linkMetadata: LinkMetadata): string {
		const codeBlockTexts = ["\n```cardlink"];
		codeBlockTexts.push(`url: ${linkMetadata.url}`);
		codeBlockTexts.push(`title: "${linkMetadata.title}"`);
		if (linkMetadata.description)
			codeBlockTexts.push(`description: "${linkMetadata.description}"`);
		if (linkMetadata.host) codeBlockTexts.push(`host: ${linkMetadata.host}`);
		if (linkMetadata.favicon)
			codeBlockTexts.push(`favicon: ${linkMetadata.favicon}`);
		if (linkMetadata.image) codeBlockTexts.push(`image: ${linkMetadata.image}`);
		codeBlockTexts.push("```\n");
		return codeBlockTexts.join("\n");
	}

	// Fetch the HTML from the URL and parse its metadata
	private async fetchLinkMetadata(
		url: string
	): Promise<LinkMetadata | undefined> {
		const res = await (async () => {
			try {
				return requestUrl({ url });
			} catch (e) {
				console.log(e);
				return;
			}
		})();
		if (!res || res.status != 200) {
			console.log(`bad response. response status code was ${res?.status}`);
			return;
		}

		const parser = new LinkMetadataParser(url, res.text);
		return parser.parse();
	}

	// Generate a random ID (used to identify the placeholder text)
	private createBlockHash(): string {
		let result = "";
		const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
		const charactersLength = characters.length;
		for (let i = 0; i < 4; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	}
}
