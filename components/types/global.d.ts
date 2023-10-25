declare namespace NodeJS {
	export interface ProcessEnv {
		DB_HOST: string;
		DB_PORT: string;
		DB_USER: string;
		DB_PASSWORD: string;
		DB_DATABASE: string;
	}
}

declare module '*.graphql' {
	import { DocumentNode } from 'graphql';

	const value: DocumentNode;
	export default value;
}