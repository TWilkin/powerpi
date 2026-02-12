#!/bin/bash

scriptPath=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
source "$scriptPath/services_utils.sh"

help() {
    echo "PowerPi buildx script"
    echo "expects 'bash buildx.sh service repo"
    echo "  service: one of the PowerPi services"
    echo "  repo: the local repo"
    exit
}

get_version() {
    local path=$scriptPath/../../kubernetes/charts/$1/Chart.yaml

    appVersion=`yq --raw-output .appVersion $path`
}

if [ $# -ne 2 ]
then
    help
fi

service=$1
repo=$2

powerpiPath=$scriptPath/../../

if ! get_service_by_chart "$service"
then
    echo "Service $service not found in services.yaml"
    exit 1
fi

get_version $service
version=$appVersion

name=powerpi-$service
path=$SERVICE_DIR
platform=linux/arm64

# build the image
image=$repo/$name:$version
echo "Building image $name:$version"
docker buildx build --load --platform $platform -t $image -t twilkin/$name:$version -f $powerpiPath/$path/Dockerfile $powerpiPath
echo

echo "Pushing image $name:$version"
docker push $repo/$name:$version
echo
