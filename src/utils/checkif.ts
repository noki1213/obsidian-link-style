// Utility class for determining the URL type

import { urlRegex, linkRegex, imageRegex } from "src/utils/regex";

export class CheckIf {
	// Determine whether the text is a URL
	public static isUrl(text: string): boolean {
		const regex = new RegExp(urlRegex);
		return regex.test(text);
	}

	// Determine whether the text is an image URL
	public static isImage(text: string): boolean {
		const regex = new RegExp(imageRegex);
		return regex.test(text);
	}

	// Determine whether the text is in markdown link format
	public static isLinkedUrl(text: string): boolean {
		const regex = new RegExp(linkRegex);
		return regex.test(text);
	}
}
