#!/bin/bash

project=$1

echo Testing $project

# required to allow node-controller to build
export PIJUICE_BUILD_BASE=1

poetry install

poetry run pytest
