import { Octokit } from "@octokit/rest";
import { Service } from "typedi";
import ConfigService from "./ConfigService";

@Service()
export default class OctokitService {
    private octokit: Octokit | undefined;

    constructor(private readonly config: ConfigService) {}

    public async getContent(path: string) {
        const octokit = await this.login();

        const user = this.config.gitHubUser;
        if (!user) {
            throw NoUserError;
        }

        const { data } = await octokit.rest.repos.getContent({
            owner: user,
            repo: this.config.repo,
            ref: this.config.branch,
            path,
        });

        return data;
    }

    private async login() {
        if (this.octokit) {
            return this.octokit;
        }

        const token = await this.config.gitHubToken;

        this.octokit = new Octokit({
            auth: token,
        });

        return this.octokit;
    }
}

class NoUserError extends Error {
    constructor() {
        super("No GitHub user set");
    }
}
