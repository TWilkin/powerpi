#!/bin/bash

include_project() {
    local project=$1
    local type=$2

    echo "Enabling tests for $type project $project"
    echo "$project=true" >> $GITHUB_OUTPUT
    echo "$type=true" >> $GITHUB_OUTPUT
}

check_file() {
    local file=$1
    local path=$2
    local project=$3
    local type=$4

    if [[ $file == $path/* ]]
    then
        include_project $project $type
    fi
}

# iterate through the changed files
git diff --name-only HEAD^ HEAD > files.txt
while IFS= read -r file
do
    echo .
    echo $file

    # skip over any README files
    if [[ $file == */README.md ]]
    then
        continue
    fi

    # updating go common requires testing everything using it
    if [[ $file == common/go/* ]]
    then
        include_project "go_common" "golang"

        include_project "energy_monitor" "golang"
        include_project "shutdown" "golang"
    fi

    # updating node common requires testing everything using it
    if [[ $file == common/node/common/* || $file == yarn.lock ]]
    then
        include_project "node_common" "nodejs"

        include_project "api" "nodejs"
        include_project "config_server" "nodejs"
        include_project "persistence" "nodejs"
        include_project "voice_assistant" "nodejs"
    fi

    # updating common-api requires testing everything using it
    if [[ $file == common/node/common-api/* || $file == yarn.lock ]]
    then
        include_project "api" "nodejs"
        include_project "ui" "nodejs"
        include_project "voice_assistant" "nodejs"
    fi

    # updating node common-test requires testing everything using it
    if [[ $file == common/node/common-test/* || $file == yarn.lock ]]
    then
        include_project "api" "nodejs"
        include_project "config_server" "nodejs"
        include_project "persistence" "nodejs"
        include_project "voice_assistant" "nodejs"
    fi

    # updating common python/pytest requires retesting everything using python
    if [[ $file == common/python/* || $file == common/pytest/* ]]
    then
        include_project "python_common" "python"

        include_project "energenie_controller" "python"
        include_project "harmony_controller" "python"
        include_project "lifx_controller" "python"
        include_project "network_controller" "python"
        include_project "snapcast_controller" "python"
        include_project "virtual_controller" "python"
        include_project "zigbee_controller" "python"

        include_project "event" "python"
        include_project "scheduler" "python"
    fi

    # check the controllers
    check_file $file "controllers/energenie" "energenie_controller" "python"
    check_file $file "controllers/harmony" "harmony_controller" "python"
    check_file $file "controllers/lifx" "lifx_controller" "python"
    check_file $file "controllers/network" "network_controller" "python"
    check_file $file "controllers/snapcast" "snapcast_controller" "python"
    check_file $file "controllers/virtual" "virtual_controller" "python"
    check_file $file "controllers/zigbee" "zigbee_controller" "python"

    # check the services
    check_file $file "services/api" "api" "nodejs"
    check_file $file "services/config-server" "config_server" "nodejs"
    check_file $file "services/energy-monitor" "energy-monitor" "golang"
    check_file $file "services/event" "event" "python"
    check_file $file "services/persistence" "persistence" "nodejs"
    check_file $file "services/scheduler" "scheduler" "python"
    check_file $file "services/shutdown" "shutdown" "golang"
    check_file $file "services/ui" "ui" "nodejs"
    check_file $file "services/voice-assistant" "voice_assistant" "nodejs"
done < files.txt
