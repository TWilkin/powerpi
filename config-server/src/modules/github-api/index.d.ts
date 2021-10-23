declare module "github-api" {
  interface GitHubOptions {
    username?: string;
    password?: string;
    token?: string;
  }

  export default class GitHub {
    constructor(options: GitHubOptions);
  }
}
