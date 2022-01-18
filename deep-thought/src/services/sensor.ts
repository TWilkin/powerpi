import { ISensor } from "@powerpi/common";
import { Service } from "@tsed/di";
import ConfigService from "./config";

@Service()
export default class SensorService {
    private _sensors: ISensor[] | undefined;

    constructor(private readonly config: ConfigService) {
        this._sensors = undefined;
    }

    public get sensors() {
        return this._sensors ?? [];
    }

    public $onInit() {
        this.initialise();
    }

    private initialise() {
        this._sensors = this.config.sensors;
    }
}
