import { Service } from "@tsed/common";
import User from "../models/user";
import Config from "./config";

@Service()
export default class UserService {
    private _users: User[] | undefined;
    private _codes: { [code: string]: User };

    constructor(private readonly config: Config) {
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

    public async $onInit() {
        await this.initialise();
    }

    private async initialise() {
        this._users = await this.config.getUsers();
    }
}
