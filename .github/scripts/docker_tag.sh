#!/bin/bash

scriptPath=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

get_version() {
    local path=$scriptPath/../../kubernetes/charts/$1/Chart.yaml

    appVersion=`yq .appVersion $path | tr -d \"`
}

registry=$1
service=$2

get_version $service

localCopy=$registry/powerpi-$service:$appVersion
remoteCopy=twilkin/powerpi-$service:$appVersion

echo "Pushing $localCopy as $remoteCopy"

docker pull $localCopy

docker tag $localCopy $remoteCopy

docker push $remoteCopy