// エディタ操作の補助機能（選択テキストの取得、カーソル位置の計算など）

import { Editor, EditorPosition } from "obsidian";

import { linkLineRegex, lineRegex } from "src/utils/regex";

interface WordBoundaries {
	start: { line: number; ch: number };
	end: { line: number; ch: number };
}

export class EditorExtensions {
	// 選択中のテキストを取得する（未選択の場合はカーソル位置のURLを自動選択する）
	public static getSelectedText(editor: Editor): string {
		if (!editor.somethingSelected()) {
			const wordBoundaries = this.getWordBoundaries(editor);
			editor.setSelection(wordBoundaries.start, wordBoundaries.end);
		}
		return editor.getSelection();
	}

	// カーソルが正規表現マッチの範囲内にあるかを判定する
	private static isCursorWithinBoundaries(
		cursor: EditorPosition,
		match: RegExpMatchArray
	): boolean {
		const startIndex = match.index ?? 0;
		const endIndex = startIndex + match[0].length;
		return startIndex <= cursor.ch && cursor.ch <= endIndex;
	}

	// カーソル位置のURL境界を取得する
	private static getWordBoundaries(editor: Editor): WordBoundaries {
		const cursor = editor.getCursor();

		const lineText = editor.getLine(cursor.line);
		// まずマークダウンリンク内にいるかチェック
		const linksInLine = lineText.matchAll(linkLineRegex);

		for (const match of linksInLine) {
			if (this.isCursorWithinBoundaries(cursor, match)) {
				const startCh = match.index ?? 0;
				return {
					start: {
						line: cursor.line,
						ch: startCh,
					},
					end: { line: cursor.line, ch: startCh + match[0].length },
				};
			}
		}

		// 通常のURL内にいるかチェック
		const urlsInLine = lineText.matchAll(lineRegex);

		for (const match of urlsInLine) {
			if (this.isCursorWithinBoundaries(cursor, match)) {
				const startCh = match.index ?? 0;
				return {
					start: { line: cursor.line, ch: startCh },
					end: { line: cursor.line, ch: startCh + match[0].length },
				};
			}
		}

		return {
			start: cursor,
			end: cursor,
		};
	}

	// テキスト内のインデックス位置からエディタの行・列位置を算出する
	public static getEditorPositionFromIndex(
		content: string,
		index: number
	): EditorPosition {
		const substr = content.substr(0, index);

		let l = 0;
		let offset = -1;
		let r = -1;
		for (; (r = substr.indexOf("\n", r + 1)) !== -1; l++, offset = r);
		offset += 1;

		const ch = content.substr(offset, index - offset).length;

		return { line: l, ch: ch };
	}
}
