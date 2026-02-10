// Show a popup menu on paste so the user can choose how to display it

import { Editor, Menu, Notice, requestUrl } from "obsidian";
import { detectUrlType } from "src/url-detector";
import { CodeBlockGenerator } from "src/card/card-generator";
import { LinkMetadataParser } from "src/card/metadata-parser";

// Show the popup menu
export function showPasteMenu(
	editor: Editor,
	url: string,
	options: {
		enableYouTubeEmbed: boolean;
		enableTwitterEmbed: boolean;
	}
): void {
	const urlType = detectUrlType(url);

	// Build the menu
	const menu = new Menu();

	// Card display (used for anything other than Twitter/X)
	if (urlType !== "twitter") {
		menu.addItem((item) => {
			item
				.setTitle("Card")
				.setIcon("credit-card")
				.onClick(() => {
					const generator = new CodeBlockGenerator(editor);
					generator.convertUrlToCodeBlock(url);
				});
		});
	}

	// Embed display (used for YouTube / Twitter/X)
	if ((urlType === "youtube" && options.enableYouTubeEmbed) ||
		(urlType === "twitter" && options.enableTwitterEmbed)) {
		menu.addItem((item) => {
			item
				.setTitle("Embed")
				.setIcon("play")
				.onClick(() => {
					insertEmbed(editor, url);
				});
		});
	}

	// Link display (convert to [title](URL) format) (used for anything other than Twitter/X)
	if (urlType !== "twitter") {
		menu.addItem((item) => {
			item
				.setTitle("Link with Title")
				.setIcon("link")
				.onClick(async () => {
					await convertUrlToMarkdownLink(editor, url);
				});
		});
	}

	// As-is (paste the URL as plain text)
	menu.addItem((item) => {
		item
			.setTitle("Plain URL")
			.setIcon("type")
			.onClick(() => {
				editor.replaceSelection(url);
			});
	});

	// Show the menu near the editor's cursor position
	const cursor = editor.getCursor();
	// @ts-ignore - coordsAtPos is an internal Obsidian API
	const coords = (editor as any).cm?.coordsAtPos?.(
		editor.posToOffset(cursor)
	);

	if (coords) {
		menu.showAtPosition({ x: coords.left, y: coords.bottom + 5 });
	} else {
		menu.showAtMouseEvent(new MouseEvent("click"));
	}
}

// Insert into the editor in ![](URL) format
function insertEmbed(editor: Editor, url: string): void {
	editor.replaceSelection(`![](${url})`);
}

// Fetch the title from the URL and convert it into a [title](URL) markdown link
async function convertUrlToMarkdownLink(editor: Editor, url: string): Promise<void> {
	// First insert placeholder text (to show that a fetch is in progress)
	const fetchingText = `[Fetching Title...](${url})`;
	editor.replaceSelection(fetchingText);

	// Fetch the page's HTML and extract the title
	let title: string | undefined;
	try {
		const res = await requestUrl({ url });
		if (res && res.status === 200) {
			const parser = new LinkMetadataParser(url, res.text);
			const metadata = await parser.parse();
			title = metadata?.title;
		}
	} catch (e) {
		console.log("auto-card-embed: failed to fetch title", e);
	}

	// Find the placeholder text and replace it
	const text = editor.getValue();
	const start = text.indexOf(fetchingText);
	if (start < 0) return;

	const end = start + fetchingText.length;
	const startPos = indexToPos(text, start);
	const endPos = indexToPos(text, end);

	if (title) {
		// If a title was retrieved → use [title](URL) format
		editor.replaceRange(`[${title}](${url})`, startPos, endPos);
	} else {
		// If no title could be retrieved → just link the bare URL
		new Notice("タイトルを取得できませんでした");
		editor.replaceRange(`[${url}](${url})`, startPos, endPos);
	}
}

// Compute the editor's line/column position from an index into the text
function indexToPos(content: string, index: number): { line: number; ch: number } {
	const substr = content.substr(0, index);
	let l = 0;
	let offset = -1;
	let r = -1;
	for (; (r = substr.indexOf("\n", r + 1)) !== -1; l++, offset = r);
	offset += 1;
	const ch = content.substr(offset, index - offset).length;
	return { line: l, ch: ch };
}
