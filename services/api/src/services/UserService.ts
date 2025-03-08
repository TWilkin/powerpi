import { ConfigFileType, ConfigRetrieverService } from "@powerpi/common";
import { Service } from "@tsed/common";
import User from "../models/User.js";
import ConfigService from "./ConfigService.js";

@Service()
export default class UserService {
    private _users: User[] | undefined;
    private _codes: { [code: string]: User };

    constructor(
        private readonly config: ConfigService,
        private readonly configRetriever: ConfigRetrieverService,
    ) {
        this._codes = {};
    }

    public get users() {
        return this._users ?? [];
    }

    public pushUser(code: string, user: User) {
        this._codes[code] = user;
    }

    public popUser(code: string) {
        const user = this._codes[code];

        if (user) {
            delete this._codes[code];
        }

        return user;
    }

    public $onInit() {
        this.initialise();

        this.configRetriever.addListener(ConfigFileType.Users, {
            onConfigChange: (type: ConfigFileType) => {
                if (type === ConfigFileType.Users) {
                    this.onConfigChange();
                }
            },
        });
    }

    protected onConfigChange() {
        // update the list of users
        this.initialise();

        // and remove any codes for removed users
        const newEmailIds = this.users.map((user) => user.email);
        this._codes = Object.keys(this._codes)
            .map((code) => ({ code, user: this._codes[code] }))
            .filter((pair) => newEmailIds.includes(pair.user.email))
            .reduce((codes, pair) => ({ ...codes, [pair.code]: pair.user }), {});
    }

    private initialise() {
        this._users = this.config.users.users;
    }
}
