import { Service } from "typedi";
import util = require("util");
import fs = require("fs");

// allow reading of files using await
const readAsync = util.promisify(fs.readFile);

@Service()
export default class ConfigService {
  protected async getSecret(key: string): Promise<string> {
    const file = await this.readFile(process.env[key] as string);
    return file;
  }

  protected async readFile(filePath: string): Promise<string> {
    return (await readAsync(filePath)).toString().trim();
  }
}
