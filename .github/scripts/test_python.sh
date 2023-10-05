#!/bin/bash

project=$1

echo Testing $project

# not every project has the powerpi dependency group
groups=main,test
if grep -q "tool.poetry.group.powerpi.dependencies" pyproject.toml
then
    groups=$groups,powerpi
fi

poetry install --only $groups

poetry run pytest
