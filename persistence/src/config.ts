import fs from 'fs';

export default class Config {

    public static get getDatabaseURI(): string {
        const user = process.env['DB_USER'];
        const password = Config.readFile(process.env['DB_PASSWORD_FILE']);
        const host = process.env['DB_HOST'];
        const port = process.env['DB_PORT'] ?? 5432;
        const schema = process.env['DB_SCHEMA'];

        return `postgres://${user}:${password}@${host}:${port}/${schema}`;
    }

    private static readFile(filePath?: string): string | undefined {
        if(filePath) {
            return fs.readFileSync(filePath).toString();
        }

        return undefined;
    }

}
