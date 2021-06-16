import fs = require("fs");
import { Device } from "powerpi-common-api";
import util = require("util");

// allow reading of files using await
const readAsync = util.promisify(fs.readFile);

export default class PowerPiConfig {
  async getDevices(): Promise<Device[]> {
    const file = await this.readFile(process.env["DEVICES_FILE"] as string);
    const json = JSON.parse(file);
    return json.devices;
  }

  private async readFile(filePath: string): Promise<any> {
    return (await readAsync(filePath)).toString().trim();
  }
}
