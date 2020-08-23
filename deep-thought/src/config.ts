import fs from 'fs';
import util from 'util';

// allow reading of files using await
const readFile = util.promisify(fs.readFile);

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

    private static async readFile(filePath: string): Promise<any> {
        return JSON.parse((await readFile(filePath)).toString());
    }
};
