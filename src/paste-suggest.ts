// 貼り付け時にポップアップメニューを表示して、表示方法を選択させる

import { Editor, Menu, Notice, requestUrl } from "obsidian";
import { detectUrlType } from "src/url-detector";
import { CodeBlockGenerator } from "src/card/card-generator";
import { LinkMetadataParser } from "src/card/metadata-parser";

// ポップアップメニューを表示する
export function showPasteMenu(
	editor: Editor,
	url: string,
	options: {
		enableYouTubeEmbed: boolean;
		enableTwitterEmbed: boolean;
	}
): void {
	const urlType = detectUrlType(url);

	// メニューを作成する
	const menu = new Menu();

	// カード表示（Twitter/X以外で表示する）
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

	// 埋め込み表示（YouTube / Twitter/X の場合に表示する）
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

	// リンク表示（[タイトル](URL) 形式に変換する）（Twitter/X以外で表示する）
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

	// そのまま（URLをプレーンテキストで貼り付ける）
	menu.addItem((item) => {
		item
			.setTitle("Plain URL")
			.setIcon("type")
			.onClick(() => {
				editor.replaceSelection(url);
			});
	});

	// エディタのカーソル位置付近にメニューを表示する
	const cursor = editor.getCursor();
	// @ts-ignore - coordsAtPos は Obsidian の内部API
	const coords = (editor as any).cm?.coordsAtPos?.(
		editor.posToOffset(cursor)
	);

	if (coords) {
		menu.showAtPosition({ x: coords.left, y: coords.bottom + 5 });
	} else {
		menu.showAtMouseEvent(new MouseEvent("click"));
	}
}

// ![](URL) 形式でエディタに挿入する
function insertEmbed(editor: Editor, url: string): void {
	editor.replaceSelection(`![](${url})`);
}

// URLからタイトルを取得して [タイトル](URL) 形式のマークダウンリンクに変換する
async function convertUrlToMarkdownLink(editor: Editor, url: string): Promise<void> {
	// まず一時テキストを挿入する（取得中であることを示す）
	const fetchingText = `[Fetching Title...](${url})`;
	editor.replaceSelection(fetchingText);

	// ページのHTMLを取得してタイトルを取り出す
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

	// 一時テキストを探して置き換える
	const text = editor.getValue();
	const start = text.indexOf(fetchingText);
	if (start < 0) return;

	const end = start + fetchingText.length;
	const startPos = indexToPos(text, start);
	const endPos = indexToPos(text, end);

	if (title) {
		// タイトルが取得できた場合 → [タイトル](URL) 形式にする
		editor.replaceRange(`[${title}](${url})`, startPos, endPos);
	} else {
		// タイトルが取得できなかった場合 → URLだけのリンクにする
		new Notice("タイトルを取得できませんでした");
		editor.replaceRange(`[${url}](${url})`, startPos, endPos);
	}
}

// テキスト内のインデックス位置からエディタの行・列位置を算出する
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
