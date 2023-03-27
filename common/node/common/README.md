# PowerPi - `@powerpi/common` - Typescript Library

PowerPi Common Typescript library provides all the shared code utilised by typescript services in PowerPi.

The library is built using typescript, with dependencies using yarn workspaces.

## Building

The library can be built by executing the following commands.

```bash
# From the root of your PowerPi checkout
# Download the dependencies
yarn

# Build the common library
yarn build:common
```

## Testing

This library can be tested by executing the following commands.

```bash
# From the root of your PowerPi checkout
# Download the dependencies
yarn

# Run the tests
yarn test:common
```

## Local Execution

This library cannot be executed itself, its code is executed within the services that depend on it.
