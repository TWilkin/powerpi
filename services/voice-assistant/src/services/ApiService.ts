import { PowerPiApi } from "@powerpi/common-api";
import { Service } from "typedi";
import ConfigService from "./ConfigService.js";

@Service()
export default class ApiService {
    private readonly api: PowerPiApi;
    private success: boolean;

    constructor(config: ConfigService) {
        this.api = new PowerPiApi(config.apiAddress);
        this.api.setErrorHandler(this.errorHandler);

        this.success = false;
    }

    async makeRequest(token: string | undefined, action: (api: PowerPiApi) => Promise<unknown>) {
        if (token) {
            this.api.setCredentials(token);
        }

        this.success = true;

        await action(this.api);

        return this.success;
    }

    private errorHandler() {
        this.success = false;
    }
}
