// URLの種類を判定するユーティリティクラス

import { urlRegex, linkRegex, imageRegex } from "src/utils/regex";

export class CheckIf {
	// テキストがURLかどうかを判定する
	public static isUrl(text: string): boolean {
		const regex = new RegExp(urlRegex);
		return regex.test(text);
	}

	// テキストが画像URLかどうかを判定する
	public static isImage(text: string): boolean {
		const regex = new RegExp(imageRegex);
		return regex.test(text);
	}

	// テキストがマークダウンリンク形式かどうかを判定する
	public static isLinkedUrl(text: string): boolean {
		const regex = new RegExp(linkRegex);
		return regex.test(text);
	}
}
