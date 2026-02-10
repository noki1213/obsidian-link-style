// Embed a Twitter/X post as an iframe

// Regex for Twitter/X URLs
export const twitterRegex = /https:\/\/(?:x|twitter)\.com\/(\w+)(?:\/status\/(\w+))?/;

// Cache of tweet heights (prevents layout shift)
const sizeCache: Record<string, number> = {};

// Generate an iframe element from a Twitter URL
export function createTwitterEmbed(url: string, darkMode: boolean): HTMLElement | null {
	const regexMatch = url.match(twitterRegex);
	if (regexMatch === null) return null;

	const iframe = document.createElement("iframe");
	const postId = regexMatch[2];
	const isPost = postId !== undefined;

	// Embedding the post
	if (isPost) {
		iframe.src = `https://platform.twitter.com/embed/Tweet.html?dnt=true&theme=${darkMode ? "dark" : "light"}&id=${postId}`;
	}
	// Embedding a profile timeline
	else {
		iframe.src = `https://syndication.twitter.com/srv/timeline-profile/screen-name/${regexMatch[1]}?dnt=true`;
	}

	iframe.classList.add("auto-card-embed-iframe", "twitter-embed-iframe");
	iframe.sandbox.add("allow-forms", "allow-presentation", "allow-same-origin", "allow-scripts", "allow-modals", "allow-popups");
	if (isPost) {
		iframe.setAttribute("scrolling", "no");
	}
	iframe.setAttribute("loading", "lazy");

	// Apply the cached height if there is one
	if (postId && sizeCache[postId]) {
		iframe.style.height = sizeCache[postId] + "px";
	}

	iframe.dataset.twitterPostId = postId;

	return iframe;
}

// Handle resize messages from Twitter (adjust the iframe to match the post's height)
export function onTwitterResizeMessage(e: MessageEvent): void {
	if (!e.data || !e.data["twttr.embed"]) return;
	if (e.data["twttr.embed"]["method"] !== "twttr.private.resize") return;

	const params = e.data["twttr.embed"]["params"][0];
	const postId = params["data"]["tweet_id"];

	const iframes = document.querySelectorAll(`.auto-card-embed-twitter-container iframe[data-twitter-post-id="${postId}"]`);
	if (iframes.length === 0) return;

	for (let i = 0; i < iframes.length; ++i) {
		const iframe = iframes[i] as HTMLIFrameElement;
		const height = (params["height"] as number) + 1;
		iframe.style.height = height + "px";

		// Match the container's height too
		if (iframe.parentElement) {
			iframe.parentElement.style.height = height + "px";
		}

		if (postId) {
			sizeCache[postId] = height;
		}
	}
}
