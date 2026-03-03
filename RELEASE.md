# Release Process

## Development Cycle

1. Make code changes to a service or controller.

2. Bump the service version (creates a release candidate):

   ```bash
   .github/scripts/version.sh --service <name>
   ```

   This increments the patch version and adds an RC suffix (e.g. `1.2.1` → `1.2.2-rc.1`).
   Subsequent bumps increment the RC number (e.g. `1.2.2-rc.1` → `1.2.2-rc.2`).

3. Build the Docker image and push to the local registry:

   ```bash
   .github/scripts/buildx.sh --service <chart-name> --repo <repo>
   ```

These steps are also available as VS Code tasks ("Version service" and "Build service").

## Creating a Release

1. **Promote Docker images** locally (while chart versions are still RC):

   ```bash
   .github/scripts/docker_tag.sh --release --repo <repo>
   ```

   This promotes all services with RC versions:
   - **Node.js/Python**: patches the version file inside the existing Docker image.
   - **Go**: rebuilds the image with the release version.

   Release images are pushed to Docker Hub as `twilkin/powerpi-<service>:<version>`.

2. **Trigger the "Promote Release" workflow** on GitHub:

   - Go to the Actions tab and select "Promote Release", or run:

     ```bash
     gh workflow run promote.yaml -f version=patch
     ```

   - Choose the version part to bump (`patch`, `minor`, or `major`).

   The workflow will:
   - Create a release branch.
   - Promote all RC service versions to release (e.g. `1.2.2-rc.1` → `1.2.2`).
   - Bump the overall PowerPi and Helm chart version.
   - Push the branch and create a pull request.

3. **Merge the pull request**. The existing release workflow will:
   - Tag each service with its new version.
   - Package the Helm chart and create a GitHub release.
