import axios from "axios";
import dateFormat from "dateformat";
import { Service } from "typedi";
import ConfigService from "./config";

type EnergyType = "electricity" | "gas";

@Service()
export default class N3rgyService {
  private static dateFormatString = "yyyymmddHHMM";

  constructor(private config: ConfigService) {}

  public getElecticity = () =>
    this.get(
      "electricity",
      new Date("2021-07-01T00:00:00"),
      new Date("2021-07-01T23:59:00")
    );

  private async get(energyType: EnergyType, start: Date, end: Date) {
    const url = `${this.config.n3rgyApiBase}/${energyType}/consumption/1`;
    const params = {
      start: dateFormat(start, N3rgyService.dateFormatString),
      end: dateFormat(end, N3rgyService.dateFormatString)
    };

    const result = await axios.get(url, {
      params,
      headers: { Authorization: await this.config.ihdId }
    });

    console.log(JSON.stringify(result?.data));
  }
}
