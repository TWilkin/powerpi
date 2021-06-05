import { Injectable, ProviderScope, ProviderType } from "@tsed/common";
import fs from "fs";
import util from "util";
import AuthConfig from "../models/auth";

// allow reading of files using await
const readFile = util.promisify(fs.readFile);

@Injectable({
  type: ProviderType.VALUE,
  scope: ProviderScope.SINGLETON
})
export default class Config {
  get mqttAddress() {
    return process.env.MQTT_ADDRESS;
  }

  get topicNameBase() {
    return process.env.TOPIC_BASE;
  }

  get externalHostName() {
    return process.env.EXTERNAL_HOST_NAME;
  }

  get externalPort() {
    return process.env.EXTERNAL_PORT;
  }

  async getDevices() {
    const file = await Config.readFile(process.env.DEVICES_FILE as string);
    const json = JSON.parse(file);
    return json.devices;
  }

  async getDatabaseURI() {
    const user = process.env.DB_USER;
    const password = await Config.readFile(
      process.env.DB_PASSWORD_FILE as string
    );
    const host = process.env.DB_HOST;
    const port = process.env.DB_PORT ?? 5432;
    const schema = process.env.DB_SCHEMA;

    return `postgres://${user}:${password}@${host}:${port}/${schema}`;
  }

  async getUsers() {
    const file = await Config.readFile(process.env.USERS_FILE as string);
    const json = JSON.parse(file);
    return json.users;
  }

  async getAuthConfig(): Promise<AuthConfig[]> {
    const protocols = ["google"];

    return await Promise.all(
      protocols.map(async (name) => {
        const envPrefix = name.toUpperCase();

        const secret = await Config.readFile(
          process.env[`${envPrefix}_SECRET_FILE`] as string
        );

        return {
          name,
          clientId: process.env[`${envPrefix}_CLIENT_ID`],
          clientSecret: secret
        } as AuthConfig;
      })
    );
  }

  private static async readFile(filePath: string): Promise<any> {
    return (await readFile(filePath)).toString().trim();
  }
}
