# PowerPi - `@powerpi/common-api` - Typescript Library

PowerPi Common API Typescript library provides all the shared code utilised by typescript services that call the _API_ in PowerPi.

The library is built using typescript, with dependencies using yarn workspaces.

## Building

The library can be built by executing the following commands.

```bash
# From the root of your PowerPi checkout
# Download the dependencies
yarn

# Build the common API library
yarn build:common-api
```

## Testing

There are currently no automated tests for this library.

## Local Execution

This library cannot be executed itself, its code is executed within the services that depend on it.
