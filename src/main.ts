// Main file for the Link Style plugin
// Unified plugin that converts URLs into either a card display or an embed display

import { Plugin, MarkdownView, Editor, Menu, MenuItem } from "obsidian";

import {
	LinkStyleSettings,
	LinkStyleSettingTab,
	DEFAULT_SETTINGS,
} from "src/settings";
import { EditorExtensions } from "src/editor-enhancements";
import { CheckIf } from "src/utils/checkif";
import { CodeBlockGenerator } from "src/card/card-generator";
import { CodeBlockProcessor } from "src/card/card-processor";
import { EmbedProcessor } from "src/embed/embed-processor";
import { onTwitterResizeMessage } from "src/embed/twitter-embed";
import { showPasteMenu } from "src/paste-suggest";
import { linkRegex } from "src/utils/regex";

export default class LinkStylePlugin extends Plugin {
	settings?: LinkStyleSettings;

	// Reference to the Twitter resize-message listener (used to remove it later)
	private twitterResizeHandler = (e: MessageEvent) => {
		if (e.origin === "https://platform.twitter.com") {
			onTwitterResizeMessage(e);
		}
	};

	async onload() {
		await this.loadSettings();

		// Register the handler for the cardlink code block (card display)
		this.registerMarkdownCodeBlockProcessor("cardlink", async (source, el) => {
			const processor = new CodeBlockProcessor(this.app);
			await processor.run(source, el);
		});

		// Register the handler for the autoembed code block (embed display)
		this.registerMarkdownCodeBlockProcessor("autoembed", (source, el) => {
			const darkMode = document.body.classList.contains("theme-dark");
			const processor = new EmbedProcessor(darkMode);
			processor.run(source, el);
		});

		// Register a listener to receive resize messages from Twitter
		window.addEventListener("message", this.twitterResizeHandler);

		// Command: paste a URL and turn it into a card display
		this.addCommand({
			id: "auto-card-embed-paste-as-card",
			name: "Paste URL as card",
			editorCallback: async (editor: Editor) => {
				await this.manualPasteAsCard(editor);
			},
			hotkeys: [],
		});

		// Command: turn the selected URL into a card display
		this.addCommand({
			id: "auto-card-embed-enhance-selected-url",
			name: "Enhance selected URL to card",
			editorCheckCallback: (checking: boolean, editor: Editor) => {
				if (!navigator.onLine) return false;
				if (checking) return true;
				this.enhanceSelectedURL(editor);
			},
			hotkeys: [
				{
					modifiers: ["Mod", "Shift"],
					key: "e",
				},
			],
		});

		// Register the paste event
		this.registerEvent(this.app.workspace.on("editor-paste", this.onPaste));

		// Register the right-click menu
		this.registerEvent(this.app.workspace.on("editor-menu", this.onEditorMenu));

		// Register the settings screen
		this.addSettingTab(new LinkStyleSettingTab(this.app, this));
	}

	// Convert the selected URL into a card display
	private enhanceSelectedURL(editor: Editor): void {
		const selectedText = (
			EditorExtensions.getSelectedText(editor) || ""
		).trim();

		const codeBlockGenerator = new CodeBlockGenerator(editor);

		for (const line of selectedText.split(/[\n ]/)) {
			if (CheckIf.isUrl(line)) {
				codeBlockGenerator.convertUrlToCodeBlock(line);
			} else if (CheckIf.isLinkedUrl(line)) {
				const url = this.getUrlFromLink(line);
				codeBlockGenerator.convertUrlToCodeBlock(url);
			}
		}
	}

	// Paste the URL from the clipboard and turn it into a card display
	private async manualPasteAsCard(editor: Editor): Promise<void> {
		const clipboardText = await navigator.clipboard.readText();
		if (clipboardText == null || clipboardText == "") return;

		if (!navigator.onLine) {
			editor.replaceSelection(clipboardText);
			return;
		}

		if (!CheckIf.isUrl(clipboardText) || CheckIf.isImage(clipboardText)) {
			editor.replaceSelection(clipboardText);
			return;
		}

		const codeBlockGenerator = new CodeBlockGenerator(editor);
		await codeBlockGenerator.convertUrlToCodeBlock(clipboardText);
	}

	// Handler for the paste event
	private onPaste = async (
		evt: ClipboardEvent,
		editor: Editor
	): Promise<void> => {
		// Do nothing if the popup is disabled
		if (!this.settings?.showPopupOnPaste) return;

		// Do nothing if offline
		if (!navigator.onLine) return;

		if (evt.clipboardData == null) return;

		// Fall back to the default handling if a file is involved
		if (evt.clipboardData.files.length > 0) return;

		const clipboardText = evt.clipboardData.getData("text/plain");
		if (clipboardText == null || clipboardText == "") return;

		// Fall back to the default handling if it's not a URL, or if it's an image URL
		if (!CheckIf.isUrl(clipboardText) || CheckIf.isImage(clipboardText)) {
			return;
		}

		// Intercept the paste and show a popup
		evt.stopPropagation();
		evt.preventDefault();

		// Show the popup menu
		showPasteMenu(editor, clipboardText, {
			enableYouTubeEmbed: this.settings?.enableYouTubeEmbed ?? true,
			enableTwitterEmbed: this.settings?.enableTwitterEmbed ?? true,
		});
	};

	// Handler for the right-click menu
	private onEditorMenu = (menu: Menu) => {
		if (!this.settings?.showInMenuItem) return;

		menu.addItem((item: MenuItem) => {
			item
				.setTitle("Paste URL as card")
				.setIcon("paste")
				.onClick(async () => {
					const editor = this.getEditor();
					if (!editor) return;
					this.manualPasteAsCard(editor);
				});
		});

		if (!navigator.onLine) return;

		menu.addItem((item: MenuItem) => {
			item
				.setTitle("Enhance selected URL to card")
				.setIcon("link")
				.onClick(() => {
					const editor = this.getEditor();
					if (!editor) return;
					this.enhanceSelectedURL(editor);
				});
		});
	};

	// Get the current editor
	private getEditor(): Editor | undefined {
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!view) return;
		return view.editor;
	}

	// Extract the URL from a markdown link
	private getUrlFromLink(link: string): string {
		const urlRegex = new RegExp(linkRegex);
		const regExpExecArray = urlRegex.exec(link);
		if (regExpExecArray === null || regExpExecArray.length < 2) {
			return "";
		}
		return regExpExecArray[2];
	}

	onunload() {
		// Remove the Twitter resize listener
		window.removeEventListener("message", this.twitterResizeHandler);
		console.log("unloading link-style");
	}

	private async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
