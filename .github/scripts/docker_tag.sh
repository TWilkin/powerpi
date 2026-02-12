#!/bin/bash
set -e

scriptPath=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
source "$scriptPath/services_utils.sh"

help() {
    echo "PowerPi Docker tag script"
    echo ""
    echo "  -h|--help              Show this help document."
    echo "  -s|--service service   The name of the service to push to Docker Hub."
    echo "  -r|--repo repo         The local repo to pull from."
    echo "  --release              Retag RC images to release versions."
    echo "                         If --service is specified, retag only that service."
    echo "                         Otherwise, retag all services with RC versions."
    exit
}

tag_and_push() {
    local registry=$1
    local service=$2

    get_chart_versions "$scriptPath/../../kubernetes/charts/$service/Chart.yaml"
    local version=$CHART_APP_VERSION
    local localCopy="$registry/powerpi-$service:$version"
    local remoteCopy="twilkin/powerpi-$service:$version"

    echo "Pushing $localCopy as $remoteCopy"
    docker pull "$localCopy"
    docker tag "$localCopy" "$remoteCopy"
    docker push "$remoteCopy"
}

retag_rc_to_release() {
    local service=$1

    get_chart_versions "$scriptPath/../../kubernetes/charts/$service/Chart.yaml"
    local version=$CHART_APP_VERSION

    if ! is_rc_version "$version"
    then
        echo "Skipping $service - version $version is not RC"
        return 0
    fi

    local releaseVersion=$(strip_rc_suffix "$version")
    local rcImage="twilkin/powerpi-$service:$version"
    local releaseImage="twilkin/powerpi-$service:$releaseVersion"

    echo "Retagging $rcImage -> $releaseImage"
    docker pull "$rcImage"
    docker tag "$rcImage" "$releaseImage"
    docker push "$releaseImage"
}

retag_from_yaml() {
    if [ "$SERVICE_CHART" != "null" ] && [ "$SERVICE_CHART" != "~" ]
    then
        retag_rc_to_release "$SERVICE_CHART"
    fi
}

# extract the command line arguments
release=false

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

        --release)
            release=true
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

if $release
then
    if [ -n "$service" ]
    then
        retag_rc_to_release "$service"
    else
        foreach_service retag_from_yaml
    fi
else
    if [ -z "$service" ] || [ -z "$repo" ]
    then
        help
    fi

    tag_and_push "$repo" "$service"
fi
