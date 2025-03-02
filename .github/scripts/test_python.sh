#!/bin/bash

project=$1

echo Testing $project

# not every project has the main and powerpi dependency group
groups=test
if grep -q "^dependencies" pyproject.toml
then
    groups=$groups,main
fi
if grep -q "tool.poetry.group.powerpi.dependencies" pyproject.toml
then
    groups=$groups,powerpi
fi

poetry install --only $groups

poetry run pytest
