> Japanese documentation is available below. (日本語ドキュメントは下部にあります)

# Link Style

An Obsidian plugin that converts URLs into styled card displays or embedded media. Supports link cards with metadata, YouTube embeds, and Twitter/X embeds.

## Features

### Card Display

Paste a URL and convert it into a rich card with automatically fetched metadata.

- Fetches the page title, description, favicon, and OG image from the URL.
- Renders as a styled card showing the title, description, hostname, favicon, and thumbnail image.
- Each card has a copy button to copy the URL to clipboard.
- Supports local images via Obsidian internal link syntax.

Card data is stored in a `cardlink` code block:

~~~
```cardlink
url: https://example.com
title: "Example Site"
description: "An example website"
host: example.com
favicon: https://example.com/favicon.ico
image: https://example.com/og-image.png
```
~~~

### Embed Display

Embed YouTube videos and Twitter/X posts directly in your notes.

- YouTube: Full video player embed. Supports regular videos, shorts, and start time parameters.
- Twitter/X: Supports individual tweet embeds and profile timeline embeds. Adapts to dark/light mode automatically. Tweets auto-resize to fit content.

Embed data is stored in an `autoembed` code block:

~~~
```autoembed
url: https://www.youtube.com/watch?v=...
type: youtube
```
~~~

### Paste Popup

When you paste a URL, a popup menu appears with the following options:

- Card: Convert the URL into a card display (fetches metadata from the page).
- Embed: Convert the URL into an embedded player (available for YouTube and Twitter/X URLs).
- Link with Title: Fetch the page title and create a markdown link in [title](url) format.
- Plain URL: Paste the URL as plain text without any conversion.

For Twitter/X URLs, only Embed and Plain URL options are shown.

### Commands

- Paste URL as card: Paste the clipboard URL as a card display.
- Enhance selected URL to card (Cmd+Shift+E): Convert a selected URL in the editor to a card display.

Both commands are also available from the right-click context menu.

### URL Detection

- Automatically detects YouTube, Twitter/X, and general URLs.
- Handles both plain URLs and markdown links in [text](url) format.
- Skips image URLs (gif, jpg, png, etc.) to avoid interfering with image handling.
- Requires an internet connection to fetch metadata.

## Settings

- Paste popup: Enable or disable the popup menu when pasting URLs.
- Context menu: Show or hide the commands in the right-click menu.
- YouTube embed: Enable or disable YouTube video embedding.
- Twitter/X embed: Enable or disable Twitter/X post embedding.

## Installation

### Via BRAT

1. Install the BRAT plugin.
2. Add `noki1213/obsidian-link-style` as a beta plugin.

### Manual

1. Download `main.js`, `manifest.json`, and `styles.css` from the latest release.
2. Create a folder named `link-style` in your vault's `.obsidian/plugins/` directory.
3. Place the downloaded files in that folder.
4. Enable the plugin in Obsidian settings.

---

# Link Style

URL をカード表示や埋め込み表示に変換する Obsidian プラグインです。メタデータ付きリンクカード、YouTube 埋め込み、Twitter/X 埋め込みに対応しています。

## 機能

### カード表示

URL を貼り付けて、自動取得したメタデータ付きのリッチなカードに変換します。

- ページのタイトル、説明文、ファビコン、OG 画像を URL から自動取得します。
- タイトル、説明文、ホスト名、ファビコン、サムネイル画像を含むカードとして表示されます。
- 各カードにはURLをクリップボードにコピーするボタンが付いています。
- Obsidian の内部リンク構文によるローカル画像にも対応しています。

カードのデータは `cardlink` コードブロックに保存されます。

~~~
```cardlink
url: https://example.com
title: "Example Site"
description: "An example website"
host: example.com
favicon: https://example.com/favicon.ico
image: https://example.com/og-image.png
```
~~~

### 埋め込み表示

YouTube 動画や Twitter/X の投稿をノート内に直接埋め込みます。

- YouTube: 動画プレーヤーを埋め込みます。通常の動画、ショート、開始時間パラメータに対応しています。
- Twitter/X: 個別のツイート埋め込みとプロフィールタイムライン埋め込みに対応しています。ダーク/ライトモードに自動的に適応します。ツイートは内容に合わせて自動リサイズされます。

埋め込みデータは `autoembed` コードブロックに保存されます。

~~~
```autoembed
url: https://www.youtube.com/watch?v=...
type: youtube
```
~~~

### ペーストポップアップ

URL を貼り付けると、以下の選択肢を含むポップアップメニューが表示されます。

- Card: URL をカード表示に変換します（ページからメタデータを取得します）。
- Embed: URL を埋め込みプレーヤーに変換します（YouTube および Twitter/X の URL で利用可能）。
- Link with Title: ページタイトルを取得し、[タイトル](URL) 形式のマークダウンリンクを作成します。
- Plain URL: 変換せずにプレーンテキストとして URL を貼り付けます。

Twitter/X の URL の場合は、Embed と Plain URL のみが表示されます。

### コマンド

- Paste URL as card: クリップボードの URL をカード表示として貼り付けます。
- Enhance selected URL to card (Cmd+Shift+E): エディタ内で選択した URL をカード表示に変換します。

両方のコマンドは右クリックメニューからも利用できます。

### URL 検出

- YouTube、Twitter/X、一般的な URL を自動検出します。
- プレーン URL と [テキスト](URL) 形式のマークダウンリンクの両方に対応しています。
- 画像 URL（gif, jpg, png など）はスキップされ、画像処理に干渉しません。
- メタデータの取得にはインターネット接続が必要です。

## 設定

- Paste popup: URL 貼り付け時のポップアップメニューの有効・無効。
- Context menu: 右クリックメニューへのコマンド表示の有効・無効。
- YouTube embed: YouTube 動画埋め込みの有効・無効。
- Twitter/X embed: Twitter/X 投稿埋め込みの有効・無効。

## インストール

### BRAT 経由

1. BRAT プラグインをインストールします。
2. `noki1213/obsidian-link-style` をベータプラグインとして追加します。

### 手動インストール

1. 最新リリースから `main.js`、`manifest.json`、`styles.css` をダウンロードします。
2. Vault の `.obsidian/plugins/` に `link-style` フォルダを作成します。
3. ダウンロードしたファイルをそのフォルダに配置します。
4. Obsidian の設定でプラグインを有効にします。
