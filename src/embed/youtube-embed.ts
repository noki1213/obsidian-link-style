// YouTube動画をiframeで埋め込み表示する

// YouTube URLの正規表現
export const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?youtu(?:\.be\/|be.com\/\S*\b(watch|embed|shorts|v|e|live)\b(?:(?:(?=\/[-a-zA-Z0-9_]{11,}(?!\S))\/)|(?:\S*v=|v\/)))([-a-zA-Z0-9_]{11,})(?:(?:\?|&)t=(\d+)s?)?/;

// YouTube URLからiframe要素を生成する
export function createYouTubeEmbed(url: string): HTMLElement | null {
	const regexMatch = url.match(youtubeRegex);
	if (regexMatch === null) return null;

	const videoType = regexMatch[1];
	const videoId = regexMatch[2];
	if (videoId === undefined) return null;

	// 埋め込み用URLを組み立てる
	let embedUrl = "https://www.youtube.com/embed/" + videoId;

	// タイムスタンプがある場合は追加する
	if (regexMatch.length >= 4 && regexMatch[3]) {
		embedUrl += "?start=" + regexMatch[3];
	}

	const iframe = document.createElement("iframe");
	iframe.src = embedUrl;
	iframe.classList.add(
		"auto-card-embed-iframe",
		"youtube" + (videoType === "shorts" ? "-shorts" : "") + "-embed"
	);
	iframe.setAttribute("allowfullscreen", "true");
	iframe.setAttribute("loading", "lazy");

	return iframe;
}
