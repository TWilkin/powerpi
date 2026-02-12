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

get_old_version() {
    local url=https://raw.githubusercontent.com/TWilkin/powerpi/main/kubernetes/charts/$1/Chart.yaml
    local path=Chart.yaml

    curl $url --output $path

    appVersion=`yq --raw-output .appVersion $path`

    rm $path
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

get_old_version $service
oldVersion=$appVersion

get_version $service
version=$appVersion

name=powerpi-$service

if ! get_service_by_chart "$service"
then
    echo "Service $service not found in services.yaml"
    exit 1
fi

path=$SERVICE_DIR
platform=linux/arm64

# retrieve the previous image
image=twilkin/$name:$oldVersion
echo "Pulling previous image $image"
docker pull $image
echo

# attempt to retrieve the new image, in case it's an update
image=$repo/$name:$version
echo "Pulling current image $image"
docker pull $image
echo

# build the image
echo "Building image $name:$version"
docker buildx build --load --platform $platform -t $image -t twilkin/$name:$version -f $powerpiPath/$path/Dockerfile $powerpiPath
echo

echo "Pushing image $name:$version"
docker push $repo/$name:$version
echo
