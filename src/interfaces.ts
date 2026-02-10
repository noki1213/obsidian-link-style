// Cardlink metadata (title, description, image, etc.)
export interface LinkMetadata {
	url: string;
	title: string;
	description?: string;
	host?: string;
	favicon?: string;
	image?: string;
	indent: number;
}

// Error thrown when YAML parsing fails
export class YamlParseError extends Error {}

// Error for when a required parameter is missing
export class NoRequiredParamsError extends Error {}
