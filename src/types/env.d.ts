declare namespace NodeJS {
	export interface ProcessEnv {
		NODE_ENV: string;
		DB_HOST: string;
		DB_NAME: string;
		DB_USERNAME: string;
		DB_PASSWORD: string;
		PORT: string;
		API: string;
	}
}
