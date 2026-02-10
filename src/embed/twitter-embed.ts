// Twitter/X の投稿をiframeで埋め込み表示する

// Twitter/X URLの正規表現
export const twitterRegex = /https:\/\/(?:x|twitter)\.com\/(\w+)(?:\/status\/(\w+))?/;

// ツイートの高さキャッシュ（レイアウトのずれを防ぐ）
const sizeCache: Record<string, number> = {};

// Twitter URLからiframe要素を生成する
export function createTwitterEmbed(url: string, darkMode: boolean): HTMLElement | null {
	const regexMatch = url.match(twitterRegex);
	if (regexMatch === null) return null;

	const iframe = document.createElement("iframe");
	const postId = regexMatch[2];
	const isPost = postId !== undefined;

	// 投稿の埋め込み
	if (isPost) {
		iframe.src = `https://platform.twitter.com/embed/Tweet.html?dnt=true&theme=${darkMode ? "dark" : "light"}&id=${postId}`;
	}
	// プロフィールタイムラインの埋め込み
	else {
		iframe.src = `https://syndication.twitter.com/srv/timeline-profile/screen-name/${regexMatch[1]}?dnt=true`;
	}

	iframe.classList.add("auto-card-embed-iframe", "twitter-embed-iframe");
	iframe.sandbox.add("allow-forms", "allow-presentation", "allow-same-origin", "allow-scripts", "allow-modals", "allow-popups");
	if (isPost) {
		iframe.setAttribute("scrolling", "no");
	}
	iframe.setAttribute("loading", "lazy");

	// キャッシュされた高さがあれば適用する
	if (postId && sizeCache[postId]) {
		iframe.style.height = sizeCache[postId] + "px";
	}

	iframe.dataset.twitterPostId = postId;

	return iframe;
}

// Twitterからのリサイズメッセージを処理する（投稿の高さに合わせてiframeを調整する）
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

		// コンテナの高さも合わせる
		if (iframe.parentElement) {
			iframe.parentElement.style.height = height + "px";
		}

		if (postId) {
			sizeCache[postId] = height;
		}
	}
}
