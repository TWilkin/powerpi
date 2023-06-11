#/bin/bash

project=$1

echo "Testing $project"

yarn test:$project
