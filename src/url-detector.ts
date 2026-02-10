// URLの種類（YouTube / Twitter / 一般）を判別する

import { youtubeRegex } from "src/embed/youtube-embed";
import { twitterRegex } from "src/embed/twitter-embed";

// URLの種類
export type UrlType = "youtube" | "twitter" | "general";

// URLの種類を判別する
export function detectUrlType(url: string): UrlType {
	if (youtubeRegex.test(url)) {
		return "youtube";
	}
	if (twitterRegex.test(url)) {
		return "twitter";
	}
	return "general";
}

// 埋め込み可能なURLかどうかを判定する（YouTube または Twitter）
export function isEmbeddable(url: string): boolean {
	return detectUrlType(url) !== "general";
}
