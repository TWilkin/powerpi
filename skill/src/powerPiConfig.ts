import fs = require("fs");
import util = require("util");
import Device from "./models/device";

// allow reading of files using await
const readAsync = util.promisify(fs.readFile);

export async function getDevices(): Promise<Device[]> {
  const file = await readFile(process.env["DEVICES_FILE"] as string);
  const json = JSON.parse(file);
  return json.devices;
}

async function readFile(filePath: string): Promise<any> {
  return (await readAsync(filePath)).toString().trim();
}
