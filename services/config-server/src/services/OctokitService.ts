import { Octokit } from "@octokit/rest";
import path from "path";
import { Service } from "typedi";
import ConfigService from "./ConfigService";

@Service()
export default class OctokitService {
    private octokit: Octokit | undefined;

    constructor(private readonly config: ConfigService) {}

    public async getContent(fileName?: string) {
        const octokit = await this.login();

        const user = this.config.gitHubUser;
        if (!user) {
            throw NoUserError;
        }

        const filePath = fileName
            ? path.join(this.config.path, fileName).replace("\\", "/")
            : this.config.path;

        const { data } = await octokit.rest.repos.getContent({
            owner: user,
            repo: this.config.repo,
            ref: this.config.branch,
            path: filePath,
        });

        return data;
    }

    public getUrl(fileName?: string) {
        let urlPath = path.join(
            this.config.gitHubUser ?? "unknown",
            this.config.repo,
            this.config.branch,
            this.config.path,
        );
        if (fileName) {
            urlPath = path.join(urlPath, fileName);
        }

        urlPath = urlPath.replace("\\", "/");

        return `github://${urlPath}`;
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
