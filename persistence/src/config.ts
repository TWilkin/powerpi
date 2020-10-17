import fs from "fs";

export default class Config {

    public static get databaseURI() {
        const user = process.env["DB_USER"];
        const password = Config.readFile(process.env["DB_PASSWORD_FILE"]);
        const host = process.env["DB_HOST"];
        const port = process.env["DB_PORT"] ?? 5432;
        const schema = process.env["DB_SCHEMA"];

        return `postgres://${user}:${password}@${host}:${port}/${schema}`;
    }

    public static get mqttAddress() {
        return process.env["MQTT_ADDRESS"];
    }

    public static get topicNameBase() {
        return process.env["TOPIC_BASE"];
    }

    private static readFile(filePath?: string): string | undefined {
        if(filePath) {
            return fs.readFileSync(filePath).toString().trim();
        }

        return undefined;
    }

}
