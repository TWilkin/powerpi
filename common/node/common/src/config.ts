import util = require("util");
import fs = require("fs");

// allow reading of files using await
const readAsync = util.promisify(fs.readFile);

export default abstract class ConfigService {
  abstract get name(): string;

  abstract get version(): string;

  protected async getSecret(key: string): Promise<string> {
    const file = await this.readFile(process.env[key] as string);
    return file;
  }

  protected async readFile(filePath: string): Promise<string> {
    return (await readAsync(filePath)).toString().trim();
  }
}
