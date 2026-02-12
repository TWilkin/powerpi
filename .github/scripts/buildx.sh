#!/bin/bash

scriptPath=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
source "$scriptPath/services_utils.sh"

help() {
    echo "PowerPi buildx script"
    echo ""
    echo "  -h|--help              Show this help document."
    echo "  -s|--service service   The name of the service to build."
    echo "  -r|--repo repo         The local repo to push to."
    exit
}

get_version() {
    local path=$scriptPath/../../kubernetes/charts/$1/Chart.yaml

    appVersion=`yq --raw-output .appVersion $path`
}

# extract the command line arguments
while [[ $# -gt 0 ]]
do
    case $1 in
        -s|--service)
            service="$2"
            shift
            shift
            ;;

        -r|--repo)
            repo="$2"
            shift
            shift
            ;;

        -h|--help)
            help
            ;;

        -*|--*)
            help
            ;;
    esac
done

if [ -z "$service" ] || [ -z "$repo" ]
then
    help
fi

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
