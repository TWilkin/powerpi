# PowerPi - `@powerpi/common-test` - Typescript Testing Library

PowerPi Common Typescript Testing library provides all the shared code utilised by the tests for typescript services in PowerPi.

The library is built using typescript, with dependencies using yarn workspaces.

## Building

The library can be built by executing the following commands.

```bash
# From the root of your PowerPi checkout
# Download the dependencies
yarn

# Build the common-test library
yarn build:common-test
```

## Testing

There are no automated tests for this library as it's utility code for other service's tests.

## Local Execution

This library cannot be executed itself, its code is executed within the tests for the services that depend on it.
