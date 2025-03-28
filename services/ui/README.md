# PowerPi - UI

PowerPi service providing hosting the React UI.

The UI is built using React and typescript, with dependencies using yarn workspaces. It is also dependant on a local common API library [_@powerpi/common-api_](../../common/node/common-api/README.md) which needs to be compiled before use.

## Building

The UI can be built locally with the following commands, which will generate the bundles in the _dist_ directory.

```bash
# From the root of your PowerPi checkout
# Download the dependencies
yarn

# Build the common API library
yarn build:common-api

# Build the UI using vite
yarn build:ui
```

The Docker container can be built utilising _buildx_ as described in the [project documentation](../../README.md#Building).

## Testing

This service can be tested by executing the following commands.

```bash
# From the root of your PowerPi checkout
# Download the dependencies
yarn

# Build the common API library
yarn build:common-api

# Run the tests
yarn test:ui
```

## Local

The UI can be started locally with the following commands.

```bash
# From the root of your PowerPi checkout
# Download the dependencies
yarn

# Build the common API library
yarn build:common-api

# Run the UI locally
yarn start:ui
```

Additionally, the _vite.config.ts_ file can be modified as follows to utilise a deployed version of the _API_ for convenient development, where _POWERPI_URL_ is the URL base for your PowerPI deployment and _TOKEN_ is the API token after authentication as stored in your cookies under _jwt_.

```js
{
    server: {
        proxy: {
            "/api": {
                changeOrigin: true,
                target: "https://POWERPI_URL:3000",
                headers: {
                    Authorization: "Bearer TOKEN"
                }
            }
        }
    }
}
```
