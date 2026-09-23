// The plugin's settings screen

import { App, PluginSettingTab, Setting } from "obsidian";

import type LinkStylePlugin from "src/main";

// Type definition for the settings
export interface LinkStyleSettings {
	// Toggle for showing the popup
	showPopupOnPaste: boolean;
	// Toggle for showing the right-click menu
	showInMenuItem: boolean;
	// Toggle for YouTube embeds
	enableYouTubeEmbed: boolean;
	// Toggle for Twitter embeds
	enableTwitterEmbed: boolean;
}

// Default settings
export const DEFAULT_SETTINGS: LinkStyleSettings = {
	showPopupOnPaste: true,
	showInMenuItem: true,
	enableYouTubeEmbed: true,
	enableTwitterEmbed: true,
};

// Tab in the settings screen
export class LinkStyleSettingTab extends PluginSettingTab {
	plugin: LinkStylePlugin;

	constructor(app: App, plugin: LinkStylePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		// Popup shown on paste
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

		// Right-click menu
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

		// YouTube embed
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

		// Twitter embed
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
