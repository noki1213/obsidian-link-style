// Auto Card Embed プラグインのメインファイル
// URLをカード表示または埋め込み表示に変換する統合プラグイン

import { Plugin, MarkdownView, Editor, Menu, MenuItem } from "obsidian";

import {
	AutoCardEmbedSettings,
	AutoCardEmbedSettingTab,
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

export default class AutoCardEmbedPlugin extends Plugin {
	settings?: AutoCardEmbedSettings;

	// Twitterリサイズメッセージのリスナー参照（解除用）
	private twitterResizeHandler = (e: MessageEvent) => {
		if (e.origin === "https://platform.twitter.com") {
			onTwitterResizeMessage(e);
		}
	};

	async onload() {
		await this.loadSettings();

		// cardlinkコードブロックの処理を登録する（カード表示）
		this.registerMarkdownCodeBlockProcessor("cardlink", async (source, el) => {
			const processor = new CodeBlockProcessor(this.app);
			await processor.run(source, el);
		});

		// autoembedコードブロックの処理を登録する（埋め込み表示）
		this.registerMarkdownCodeBlockProcessor("autoembed", (source, el) => {
			const darkMode = document.body.classList.contains("theme-dark");
			const processor = new EmbedProcessor(darkMode);
			processor.run(source, el);
		});

		// Twitterのリサイズメッセージを受け取るリスナーを登録する
		window.addEventListener("message", this.twitterResizeHandler);

		// コマンド: URLを貼り付けてカード表示にする
		this.addCommand({
			id: "auto-card-embed-paste-as-card",
			name: "Paste URL as card",
			editorCallback: async (editor: Editor) => {
				await this.manualPasteAsCard(editor);
			},
			hotkeys: [],
		});

		// コマンド: 選択中のURLをカード表示にする
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

		// ペーストイベントを登録する
		this.registerEvent(this.app.workspace.on("editor-paste", this.onPaste));

		// 右クリックメニューを登録する
		this.registerEvent(this.app.workspace.on("editor-menu", this.onEditorMenu));

		// 設定画面を登録する
		this.addSettingTab(new AutoCardEmbedSettingTab(this.app, this));
	}

	// 選択中のURLをカード表示に変換する
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

	// クリップボードのURLを貼り付けてカード表示にする
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

	// ペーストイベントのハンドラ
	private onPaste = async (
		evt: ClipboardEvent,
		editor: Editor
	): Promise<void> => {
		// ポップアップが無効の場合は何もしない
		if (!this.settings?.showPopupOnPaste) return;

		// オフラインの場合は何もしない
		if (!navigator.onLine) return;

		if (evt.clipboardData == null) return;

		// ファイルが含まれている場合はデフォルト処理に任せる
		if (evt.clipboardData.files.length > 0) return;

		const clipboardText = evt.clipboardData.getData("text/plain");
		if (clipboardText == null || clipboardText == "") return;

		// URLでない場合、または画像URLの場合はデフォルト処理に任せる
		if (!CheckIf.isUrl(clipboardText) || CheckIf.isImage(clipboardText)) {
			return;
		}

		// ペーストを横取りしてポップアップを表示する
		evt.stopPropagation();
		evt.preventDefault();

		// ポップアップメニューを表示する
		showPasteMenu(editor, clipboardText, {
			enableYouTubeEmbed: this.settings?.enableYouTubeEmbed ?? true,
			enableTwitterEmbed: this.settings?.enableTwitterEmbed ?? true,
		});
	};

	// 右クリックメニューのハンドラ
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

	// 現在のエディタを取得する
	private getEditor(): Editor | undefined {
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!view) return;
		return view.editor;
	}

	// マークダウンリンクからURLを取り出す
	private getUrlFromLink(link: string): string {
		const urlRegex = new RegExp(linkRegex);
		const regExpExecArray = urlRegex.exec(link);
		if (regExpExecArray === null || regExpExecArray.length < 2) {
			return "";
		}
		return regExpExecArray[2];
	}

	onunload() {
		// Twitterリサイズリスナーを解除する
		window.removeEventListener("message", this.twitterResizeHandler);
		console.log("unloading auto-card-embed");
	}

	private async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
