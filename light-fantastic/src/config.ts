import fs from 'fs';
import util from 'util';

// allow reading of files using await
const readFile = util.promisify(fs.readFile);

export default class Config {
    private _devices: any;
    private _schedules: any;

    get devices() { return this._devices; }
    get schedules() { return this._schedules; }

    public async load() {
        this._devices = (await Config.readFile(process.env['DEVICES_FILE'] as string)).devices;
        this._schedules = await Config.readFile(process.env['SCHEDULES_FILE'] as string);
    }

    private static async readFile(filePath: string): Promise<any> {
        return JSON.parse((await readFile(filePath)).toString());
    }
};
