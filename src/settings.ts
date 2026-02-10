// プラグインの設定画面

import { App, PluginSettingTab, Setting } from "obsidian";

import type AutoCardEmbedPlugin from "src/main";

// 設定の型定義
export interface AutoCardEmbedSettings {
	// ポップアップ表示のオン/オフ
	showPopupOnPaste: boolean;
	// 右クリックメニュー表示のオン/オフ
	showInMenuItem: boolean;
	// YouTube 埋め込みのオン/オフ
	enableYouTubeEmbed: boolean;
	// Twitter 埋め込みのオン/オフ
	enableTwitterEmbed: boolean;
}

// 初期設定値
export const DEFAULT_SETTINGS: AutoCardEmbedSettings = {
	showPopupOnPaste: true,
	showInMenuItem: true,
	enableYouTubeEmbed: true,
	enableTwitterEmbed: true,
};

// 設定画面のタブ
export class AutoCardEmbedSettingTab extends PluginSettingTab {
	plugin: AutoCardEmbedPlugin;

	constructor(app: App, plugin: AutoCardEmbedPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		// ペースト時のポップアップ
		new Setting(containerEl)
			.setName("Paste popup")
			.setDesc(
				"URLを貼り付けたときにポップアップで表示方法を選択する"
			)
			.addToggle((val) => {
				if (!this.plugin.settings) return;
				return val
					.setValue(this.plugin.settings.showPopupOnPaste)
					.onChange(async (value) => {
						if (!this.plugin.settings) return;
						this.plugin.settings.showPopupOnPaste = value;
						await this.plugin.saveSettings();
					});
			});

		// 右クリックメニュー
		new Setting(containerEl)
			.setName("Context menu")
			.setDesc("右クリックメニューにコマンドを追加する")
			.addToggle((val) => {
				if (!this.plugin.settings) return;
				return val
					.setValue(this.plugin.settings.showInMenuItem)
					.onChange(async (value) => {
						if (!this.plugin.settings) return;
						this.plugin.settings.showInMenuItem = value;
						await this.plugin.saveSettings();
					});
			});

		// YouTube埋め込み
		new Setting(containerEl)
			.setName("YouTube embed")
			.setDesc(
				"YouTube URLの埋め込み表示を有効にする"
			)
			.addToggle((val) => {
				if (!this.plugin.settings) return;
				return val
					.setValue(this.plugin.settings.enableYouTubeEmbed)
					.onChange(async (value) => {
						if (!this.plugin.settings) return;
						this.plugin.settings.enableYouTubeEmbed = value;
						await this.plugin.saveSettings();
					});
			});

		// Twitter埋め込み
		new Setting(containerEl)
			.setName("Twitter/X embed")
			.setDesc(
				"Twitter/X URLの埋め込み表示を有効にする"
			)
			.addToggle((val) => {
				if (!this.plugin.settings) return;
				return val
					.setValue(this.plugin.settings.enableTwitterEmbed)
					.onChange(async (value) => {
						if (!this.plugin.settings) return;
						this.plugin.settings.enableTwitterEmbed = value;
						await this.plugin.saveSettings();
					});
			});
	}
}
