import axios from "axios";
import dateFormat from "dateformat";
import { Service } from "typedi";
import N3rgyData from "../models/N3rgyData";
import ConfigService from "./ConfigService";

export enum EnergyType {
    Electricity = "electricity",
    Gas = "gas",
}

@Service()
export default class N3rgyService {
    private static dateFormatString = "yyyymmddHHMM";

    constructor(private config: ConfigService) {}

    public getElecticity = (start: Date, end: Date) => this.get(EnergyType.Electricity, start, end);

    public getGas = (start: Date, end: Date) => this.get(EnergyType.Gas, start, end);

    private async get(energyType: EnergyType, start: Date, end: Date) {
        const url = `${this.config.n3rgyApiBase}/${energyType}/consumption/1`;

        const params = {
            start: dateFormat(start, N3rgyService.dateFormatString),
            end: dateFormat(end, N3rgyService.dateFormatString),
        };

        const { data, status } = await axios.get<N3rgyData>(url, {
            params,
            headers: {
                Authorization: await this.config.ihdId,
                "User-Agent": `${this.config.service}/${this.config.version}`,
            },
        });

        if (!(status >= 200 && status < 300)) {
            throw `API call returned ${status}`;
        }

        if (data.message) {
            throw data.message;
        }

        return data;
    }
}
