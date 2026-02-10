// Embed a YouTube video as an iframe

// Regex for YouTube URLs
export const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?youtu(?:\.be\/|be.com\/\S*\b(watch|embed|shorts|v|e|live)\b(?:(?:(?=\/[-a-zA-Z0-9_]{11,}(?!\S))\/)|(?:\S*v=|v\/)))([-a-zA-Z0-9_]{11,})(?:(?:\?|&)t=(\d+)s?)?/;

// Generate an iframe element from a YouTube URL
export function createYouTubeEmbed(url: string): HTMLElement | null {
	const regexMatch = url.match(youtubeRegex);
	if (regexMatch === null) return null;

	const videoType = regexMatch[1];
	const videoId = regexMatch[2];
	if (videoId === undefined) return null;

	// Build the URL used for the embed
	let embedUrl = "https://www.youtube.com/embed/" + videoId;

	// Append the timestamp if there is one
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
