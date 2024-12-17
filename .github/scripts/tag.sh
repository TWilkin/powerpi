#!/bin/bash

get_version() {
    local file=$1
    local file_regex=$2
    local version_regex=$3

    local version_str=`grep $file_regex $file | head -n 1`
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

get_makefile_version() {
    local file=$1
    local file_regex='VERSION=\s*.*'
    local version_regex="VERSION=\s*(.*)"

    get_version $file $file_regex $version_regex
}

tag_service() {
    local directory="$1"
    local name=$2

    version=
    local path="${GITHUB_WORKSPACE}/$directory"

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

    # check Makefile
    file="$path/Makefile"
    if [ -f "$file" ]
    then
        get_makefile_version $file
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
tag_service "controllers/network" "network-controller"
tag_service "controllers/snapcast" "snapcast-controller"
tag_service "controllers/virtual" "virtual-controller"
tag_service "controllers/zigbee" "zigbee-controller"

tag_service "sensors" "powerpi-sensor"

tag_service "services/api" "api"
tag_service "services/config-server" "config-server"
tag_service "services/energy-monitor" "energy-monitor"
tag_service "services/event" "event"
tag_service "services/persistence" "persistence"
tag_service "services/scheduler" "scheduler"
tag_service "services/shutdown" "shutdown"
tag_service "services/ui" "ui"
tag_service "services/voice-assistant" "voice-assistant"
