import axios from "axios";
import dateFormat from "dateformat";
import { Service } from "typedi";
import N3rgyData from "../models/n3rgy";
import ConfigService from "./config";

export type EnergyType = "electricity" | "gas";

@Service()
export default class N3rgyService {
    private static dateFormatString = "yyyymmddHHMM";

    constructor(private config: ConfigService) {}

    public getElecticity = (start: Date, end: Date) => this.get("electricity", start, end);

    public getGas = (start: Date, end: Date) => this.get("gas", start, end);

    private async get(energyType: EnergyType, start: Date, end: Date) {
        const url = `${this.config.n3rgyApiBase}/${energyType}/consumption/1`;
        const params = {
            start: dateFormat(start, N3rgyService.dateFormatString),
            end: dateFormat(end, N3rgyService.dateFormatString),
        };

        const result = await axios.get(url, {
            params,
            headers: {
                Authorization: await this.config.ihdId,
                "User-Agent": `powerpi-${this.config.service} ${this.config.version}`,
            },
        });

        if (!(result?.status >= 200 && result?.status < 300)) {
            throw `API call returned ${result.status}`;
        }

        const data = result?.data as N3rgyData;

        if (data.message) {
            throw data.message;
        }

        return data;
    }
}
