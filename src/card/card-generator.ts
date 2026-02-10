// URLからcardlinkコードブロックを生成する

import { Editor, Notice, requestUrl } from "obsidian";

import { LinkMetadata } from "src/interfaces";
import { EditorExtensions } from "src/editor-enhancements";
import { LinkMetadataParser } from "src/card/metadata-parser";

export class CodeBlockGenerator {
	editor: Editor;

	constructor(editor: Editor) {
		this.editor = editor;
	}

	// URLをcardlinkコードブロックに変換してエディタに挿入する
	async convertUrlToCodeBlock(url: string): Promise<void> {
		const selectedText = this.editor.getSelection();

		// 一時的な表示用テキストを生成（取得中であることを示す）
		const pasteId = this.createBlockHash();
		const fetchingText = `[Fetching Data#${pasteId}](${url})`;

		// まず一時テキストを挿入（取得完了後に置き換える）
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

		// メタデータの取得に失敗した場合、元のテキストに戻す
		if (!linkMetadata) {
			new Notice("Couldn't fetch link metadata");
			this.editor.replaceRange(selectedText || url, startPos, endPos);
			return;
		}
		this.editor.replaceRange(this.genCodeBlock(linkMetadata), startPos, endPos);
	}

	// メタデータからcardlinkコードブロックのテキストを生成する
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

	// URLからHTMLを取得してメタデータを解析する
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

	// ランダムなIDを生成する（一時テキストの識別用）
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
