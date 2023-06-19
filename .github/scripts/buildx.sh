#!/bin/bash

scriptPath=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

help() {
    echo "PowerPi buildx script"
    echo "expects 'bash buildx.sh service repo"
    echo "  service: one of the PowerPi services"
    echo "  repo: the local repo"
    exit
}

get_old_version() {
    local url=https://raw.githubusercontent.com/TWilkin/powerpi/main/kubernetes/charts/$1/Chart.yaml
    local path=Chart.yaml

    curl $url --output $path

    appVersion=`yq .appVersion $path`

    rm $path
}

get_version() {
    local path=$scriptPath/../../kubernetes/charts/$1/Chart.yaml

    appVersion=`yq .appVersion $path`
}

if [ $# -ne 2 ]
then
    help
fi

service=$1
repo=$2

powerpiPath=$scriptPath/../../

get_old_version $service
oldVersion=$appVersion

get_version $service
version=$appVersion

name=powerpi-$service

path=services/$service
platform=linux/arm64

if [[ $service == *controller ]]
then
    split=(${service//-/ })

    path=controllers/${split[0]}
    platform=linux/arm/v7
fi

if [[ $service == "scheduler" ]]
then
    platform=linux/arm/v7
fi

# retrieve the previous image
echo "Pulling previous image"
docker pull twilkin/$name:$oldVersion
echo

# build the image
echo "Building image $name:$version"
docker buildx build --load --platform $platform -t $repo/$name:$version -t twilkin/$name:$version -f $powerpiPath/$path/Dockerfile $powerpiPath
echo

echo "Pushing image $name:$version"
docker push $repo/$name:$version
echo
