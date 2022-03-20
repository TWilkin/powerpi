# PowerPi - `powerpi_common_test` - Python Library

PowerPi Common Test Python library provides all the shared test code utilised by the _powerpi_common_ library and the controllers.

The library is built using python, with dependencies using [poetry](https://python-poetry.org/).

## Testing

This library provides no tests of its own as the test code is executed as part of the tests for _powerpi_common_ and controller test suites.

## Local Execution

This library cannot be executed itself, its code is executed within _powerpi_common_ and the controllers that depend on it when executing their tests.
