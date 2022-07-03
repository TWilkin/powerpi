#!/bin/bash

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

get_autoconf_version() {
    local file=$1
    local file_regex='AC_INIT(\[.*\],\s*\[.*\])'
    local version_regex="AC_INIT\(\[.*\],\s*\[(.*)]\)"

    get_version $file $file_regex $version_regex
}

tag_service() {
    local directory="$1"
    local name=$2

    version=
    local path="${GITHUB_WORKSPACE}/../../$1"

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

    # check configure.ac
    file="$path/configure.ac"
    if [ -f "$file" ]
    then
        get_autoconf_version $file
    fi

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

tag_service "controllers/energenie" "energenie-controller"
tag_service "controllers/harmony" "harmony-controller"
tag_service "controllers/lifx" "lifx-controller"
tag_service "controllers/macro" "macro-controller"
tag_service "controllers/zigbee" "zigbee-controller"

tag_service "esp8266" "powerpi-sensor"

tag_service "services/babel-fish" "babel-fish"
tag_service "services/clacks-config" "clacks-config"
tag_service "services/deep-thought" "deep-thought"
tag_service "services/energy-monitor" "energy-monitor"
tag_service "services/freedns" "freedns"
tag_service "services/light-fantastic" "light-fantastic"
tag_service "services/nginx/ui" "ui"
tag_service "services/persistence" "persistence"
