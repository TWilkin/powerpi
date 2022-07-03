#!/bin/bash

# ensure we have all the existing tags
# git fetch origin
# git fetch --prune origin +refs/tags/*:refs/tags/*

get_node_version() {
    local file=$1

    local version_str=`grep '\"version\":\s*\".*\"' $file`

    local regex="\"version\":\s*\"(.*)\""
    if [[ $version_str =~ $regex ]]
    then
        version="${BASH_REMATCH[1]}"
    fi

    return
}

tag_service() {
    local directory="$1"
    local name=$2

    version=
    local path="../../$1"

    # check package.json
    local file="$path/package.json"
    if [ -f "$file" ]
    then
        get_node_version $file
    fi

    if [ -z "$version" ]
    then
        echo "Could not find version for $name"
    else
        version="$name/v$version"
        echo "Found version $version"
    fi
}

echo "Looking for changed versions"
tag_service "controllers/energenie" "energenie-controller"
tag_service "services/babel-fish" "babel-fish"
