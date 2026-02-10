// Process the autoembed code block and render it as an embedded iframe

import { parseYaml } from "obsidian";
import { createYouTubeEmbed } from "src/embed/youtube-embed";
import { createTwitterEmbed } from "src/embed/twitter-embed";

// Data format for the autoembed code block
interface AutoEmbedData {
	url: string;
	type: string;
}

export class EmbedProcessor {
	darkMode: boolean;

	constructor(darkMode: boolean) {
		this.darkMode = darkMode;
	}

	// Parse the code block's contents and generate an embedded iframe
	run(source: string, el: HTMLElement): void {
		let data: AutoEmbedData;

		try {
			// Convert tabs to spaces before parsing the YAML
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

		// Generate the embed based on its type
		if (data.type === "youtube") {
			embed = createYouTubeEmbed(data.url);
		} else if (data.type === "twitter") {
			embed = createTwitterEmbed(data.url, this.darkMode);
		}

		if (!embed) {
			el.appendChild(this.genErrorEl(`埋め込みの生成に失敗しました: ${data.url}`));
			return;
		}

		// Wrap it in a container
		const containerEl = document.createElement("div");
		if (data.type === "twitter") {
			containerEl.classList.add("auto-card-embed-twitter-container");
		} else {
			containerEl.classList.add("auto-card-embed-container");
		}
		containerEl.appendChild(embed);
		el.appendChild(containerEl);
	}

	// Generate the HTML element that displays the error message
	private genErrorEl(errorMsg: string): HTMLElement {
		const containerEl = document.createElement("div");
		containerEl.classList.add("auto-card-embed-error");

		const spanEl = document.createElement("span");
		spanEl.textContent = `autoembed error: ${errorMsg}`;
		containerEl.appendChild(spanEl);

		return containerEl;
	}
}
