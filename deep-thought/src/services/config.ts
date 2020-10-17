import fs from 'fs';
import util from 'util';
import { Injectable, ProviderType, ProviderScope } from '@tsed/common';

// allow reading of files using await
const readFile = util.promisify(fs.readFile);

@Injectable({
    type: ProviderType.VALUE,
    scope: ProviderScope.SINGLETON
})
export default class Config {
    get mqttAddress() {
        return process.env['MQTT_ADDRESS'];
    }

    get topicNameBase() {
        return process.env['TOPIC_BASE'];
    }

    async getDevices() { 
        return (await Config.readFile(process.env['DEVICES_FILE'] as string)).devices
    }

    async getDatabaseURI() {
        const user = process.env["DB_USER"];
        const password = await Config.readFile(process.env["DB_PASSWORD_FILE"] as string);
        const host = process.env["DB_HOST"];
        const port = process.env["DB_PORT"] ?? 5432;
        const schema = process.env["DB_SCHEMA"];

        return `postgres://${user}:${password}@${host}:${port}/${schema}`;
    }

    private static async readFile(filePath: string): Promise<any> {
        return JSON.parse((await readFile(filePath)).toString());
    }
};
