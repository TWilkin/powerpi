import { Service } from "@tsed/common";
import User from "../models/user";
import Config from "./config";

@Service()
export default class UserService {
  private _users: User[] | undefined;

  constructor(private readonly config: Config) {}

  public get users() {
    return this._users ?? [];
  }

  public async $onInit() {
    this.initialise();
  }

  private async initialise() {
    this._users = await this.config.getUsers();
  }
}
