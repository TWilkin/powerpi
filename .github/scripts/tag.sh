#!/bin/bash

# ensure we have all the existing tags
# git fetch origin
# git fetch --prune origin +refs/tags/*:refs/tags/*

get_version() {
    local file=$1
    local file_regex=$2
    local version_regex=$3

    local version_str=`grep $file_regex $file`
    if [[ $version_str =~ $version_regex ]]
    then
        version="${BASH_REMATCH[1]}"
    fi
}

get_node_version() {
    local file=$1
    local file_regex='\"version\":\s*\".*\"'
    local version_regex="\"version\":\s*\"(.*)\""
    
    get_version $file $file_regex $version_regex
}

get_poetry_version() {
    local file=$1
    local file_regex='version\s*=\s*\".*\"'
    local version_regex="version\s*=\s*\"(.*)\""
    
    get_version $file $file_regex $version_regex
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

    # check pyproject.toml
    file="$path/pyproject.toml"
    if [ -f "$file" ]
    then
        get_poetry_version $file
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
