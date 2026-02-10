// autoembedコードブロックを処理してiframe埋め込みを表示する

import { parseYaml } from "obsidian";
import { createYouTubeEmbed } from "src/embed/youtube-embed";
import { createTwitterEmbed } from "src/embed/twitter-embed";

// autoembedコードブロックのデータ形式
interface AutoEmbedData {
	url: string;
	type: string;
}

export class EmbedProcessor {
	darkMode: boolean;

	constructor(darkMode: boolean) {
		this.darkMode = darkMode;
	}

	// コードブロックの中身を解析して埋め込みiframeを生成する
	run(source: string, el: HTMLElement): void {
		let data: AutoEmbedData;

		try {
			// タブをスペースに変換してからYAMLを解析する
			const normalizedSource = source
				.split(/\r?\n|\r|\n/g)
				.map((line) => line.replace(/^\t+/g, (tabs) => " ".repeat(tabs.length)))
				.join("\n");

			data = parseYaml(normalizedSource) as AutoEmbedData;
		} catch (error) {
			console.log("autoembed: YAML parse error", error);
			el.appendChild(this.genErrorEl("YAMLの解析に失敗しました"));
			return;
		}

		if (!data || !data.url || !data.type) {
			el.appendChild(this.genErrorEl("url と type が必要です"));
			return;
		}

		let embed: HTMLElement | null = null;

		// 種類に応じて埋め込みを生成する
		if (data.type === "youtube") {
			embed = createYouTubeEmbed(data.url);
		} else if (data.type === "twitter") {
			embed = createTwitterEmbed(data.url, this.darkMode);
		}

		if (!embed) {
			el.appendChild(this.genErrorEl(`埋め込みの生成に失敗しました: ${data.url}`));
			return;
		}

		// コンテナで囲む
		const containerEl = document.createElement("div");
		if (data.type === "twitter") {
			containerEl.classList.add("auto-card-embed-twitter-container");
		} else {
			containerEl.classList.add("auto-card-embed-container");
		}
		containerEl.appendChild(embed);
		el.appendChild(containerEl);
	}

	// エラーメッセージを表示するHTML要素を生成する
	private genErrorEl(errorMsg: string): HTMLElement {
		const containerEl = document.createElement("div");
		containerEl.classList.add("auto-card-embed-error");

		const spanEl = document.createElement("span");
		spanEl.textContent = `autoembed error: ${errorMsg}`;
		containerEl.appendChild(spanEl);

		return containerEl;
	}
}
