// カードリンクのメタデータ（タイトル、説明文、画像など）
export interface LinkMetadata {
	url: string;
	title: string;
	description?: string;
	host?: string;
	favicon?: string;
	image?: string;
	indent: number;
}

// YAMLの解析に失敗したときのエラー
export class YamlParseError extends Error {}

// 必須パラメータが見つからないときのエラー
export class NoRequiredParamsError extends Error {}
