# PowerPi - `powerpi_common` - Python Library

PowerPi Common Python library provides all the shared code utilised by the controllers.

The library is built using python, with dependencies using [poetry](https://python-poetry.org/). It is also dependant on a local testing library [_powerpi_common_test_](../common/pytest/README.md).

## Testing

This library can be tested by executing the following commands.

```bash
# From the common/python directory in your PowerPi checkout
# Download the dependencies
poetry install

# Run the tests
poetry run pytest
```

## Local Execution

This library cannot be executed itself, its code is executed within the controllers that depend on it.
