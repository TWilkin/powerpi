#!/bin/bash

scriptPath=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
source "$scriptPath/services_utils.sh"

tag_service() {
    local directory="$1"
    local name=$2

    local path="${GITHUB_WORKSPACE}/$directory"
    local version=$(get_source_version "$path")

    if [ -z "$version" ]
    then
        echo "Could not find version for $name"
    else
        version="$name/v$version"
        echo "Found version $version"

        # see if the tag exists
        tag_exists=`git tag | grep $version | wc -l`
        if [ $tag_exists -eq "0" ]
        then
            # create the tag
            echo "Creating tag for $version"
            message=`git show -s --format=%s`
            git tag -a $version -m "$version: $message"
            git push origin $version
        else
            echo "Tag for $version already exists"
        fi
    fi

    echo
}

# ensure we have all the existing tags
git fetch origin
git fetch --prune origin +refs/tags/*:refs/tags/*

echo "Looking for changed versions"

tag_from_yaml() {
    local tag_name="$SERVICE_NAME"
    if [ "$SERVICE_CHART" != "null" ] && [ "$SERVICE_CHART" != "~" ]
    then
        tag_name="$SERVICE_CHART"
    fi

    tag_service "$SERVICE_DIR" "$tag_name"
}

foreach_service tag_from_yaml
foreach_sensor tag_from_yaml
