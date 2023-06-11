#!/bin/bash

project=$1

echo Testing $project

poetry install

poetry run pytest
