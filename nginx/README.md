# PowerPi \ NGINX (UI)

PowerPi service providing reverse proxy for [_deep-thought_ (API)](../deep-thought/README.md) and [_babel-fish_ (Alexa integration)](../babel-fish/README.md), edge SSL for HTTPS and hosting the React UI.

The UI is built using React and typescript, with dependencies using yarn workspaces. It is also dependant on a local common library [_@powerpi/api_](../common/node/api/README.md) which needs to be compiled before use.

## Building

The UI can be built locally with the following commands, which will generate the bundles in the _ui/dist_ directory.

```bash
# From the root of your PowerPi checkout
# Download the dependencies
yarn

# Build the common library
yarn build:api

# Build the UI using webpack
yarn build:ui
```

The Docker container can be built utilising _buildx_ as described in the [project documentation](../README.md#Building).

## Testing

There are currently no automated tests for this service.

However, you can run the UI locally with the following command.

```bash
# From the root of your PowerPi checkout
# Download the dependencies
yarn

# Build the common library
yarn build:api

# Run the UI locally
yarn start:ui
```

Additionally, the _ui/webpack.dev.js_ file can be modified as follows to utilise a deployed version of _deep-thought_ for convenient development, where _POWERPI_URL_ is the URL base for your PowerPI deployment and _TOKEN_ is the API token after authentication as stored in your cookies under _jwt_.

```json
{
    devServer: {
        ...,
        proxy: {
            "/api": {
                changeOrigin: true,
                target: "https://POWERPI_URL:3000",
                headers: {
                    Authorization: "Bearer TOKEN",
                },
            },
        },
    }
}
```
