// Determine the URL type (YouTube / Twitter / generic)

import { youtubeRegex } from "src/embed/youtube-embed";
import { twitterRegex } from "src/embed/twitter-embed";

// URL type
export type UrlType = "youtube" | "twitter" | "general";

// Determine the URL type
export function detectUrlType(url: string): UrlType {
	if (youtubeRegex.test(url)) {
		return "youtube";
	}
	if (twitterRegex.test(url)) {
		return "twitter";
	}
	return "general";
}

// Determine whether the URL can be embedded (YouTube or Twitter)
export function isEmbeddable(url: string): boolean {
	return detectUrlType(url) !== "general";
}
