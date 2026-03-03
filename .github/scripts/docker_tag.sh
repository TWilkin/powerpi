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
    echo "  --release              Promote RC images to release versions."
    echo "                         If --service is specified, promote only that service."
    echo "                         Otherwise, promote all services with RC versions."
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

# Patch a file inside a Docker image and commit as a new image
# Usage: patch_image "source:tag" "dest:tag" "/path/in/container" update_callback
patch_image() {
    local sourceImage=$1
    local destImage=$2
    local containerPath=$3
    local updateFn=$4

    local container=$(docker create "$sourceImage")
    local tmpFile=$(mktemp)

    docker cp "$container:$containerPath" "$tmpFile"
    $updateFn "$tmpFile"
    docker cp "$tmpFile" "$container:$containerPath"

    docker commit "$container" "$destImage"
    docker rm "$container"
    rm -f "$tmpFile"
}

update_node_version() {
    local tmpFile=$1
    local updated=$(mktemp)

    jq --indent 4 ".version = \"$releaseVersion\"" "$tmpFile" > "$updated"
    mv "$updated" "$tmpFile"
}

update_python_version() {
    local tmpFile=$1

    sed -i "s/version = \".*\"/version = \"$releaseVersion\"/" "$tmpFile"
}

promote_image() {
    local service=$1
    local repo=$2

    if ! get_service_by_chart "$service"
    then
        echo "Service $service not found in services.yaml"
        return 1
    fi

    get_chart_versions "$scriptPath/../../kubernetes/charts/$service/Chart.yaml"
    local version=$CHART_APP_VERSION

    if ! is_rc_version "$version"
    then
        echo "Skipping $service - version $version is not RC"
        return 0
    fi

    local releaseVersion=$(strip_rc_suffix "$version")
    local rcImage="$repo/powerpi-$service:$version"
    local releaseImage="twilkin/powerpi-$service:$releaseVersion"

    echo "Promoting $service: $version -> $releaseVersion"
    docker pull "$rcImage"

    case "$SERVICE_TYPE" in
        nodejs)
            patch_image "$rcImage" "$releaseImage" \
                "/home/node/app/$SERVICE_DIR/package.json" \
                update_node_version
            ;;

        python)
            patch_image "$rcImage" "$releaseImage" \
                "/usr/src/app/pyproject.toml" \
                update_python_version
            ;;

        golang)
            echo "Rebuilding $service with release version"
            bash "$scriptPath/buildx.sh" --service "$service" --repo "$repo" --version "$releaseVersion"
            docker tag "$repo/powerpi-$service:$releaseVersion" "$releaseImage"
            ;;
    esac

    docker push "$releaseImage"
}

promote_from_yaml() {
    if [ "$SERVICE_CHART" != "null" ] && [ "$SERVICE_CHART" != "~" ]
    then
        promote_image "$SERVICE_CHART" "$repo"
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
    if [ -z "$repo" ]
    then
        help
    fi

    if [ -n "$service" ]
    then
        promote_image "$service" "$repo"
    else
        foreach_service promote_from_yaml
    fi
else
    if [ -z "$service" ] || [ -z "$repo" ]
    then
        help
    fi

    tag_and_push "$repo" "$service"
fi
