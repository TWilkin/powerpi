#!/bin/bash

include_project() {
    local project=$1
    local type=$2

    echo "Enabling tests for $project"
    echo "$project=true" >> $GITHUB_OUTPUT

    if [[ $type -eq "node" ]]
    then
        echo "node=true" >> $GITHUB_OUTPUT
    elif [[ $type -eq "python" ]]
    then
        echo "python=true" >> $GITHUB_OUTPUT
    fi
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
    echo $file

    # updating API requires testing everything using it
    if [[ $file == common/node/api/* ]]
    then
        include_project "ui" "node"
        include_project "voice-assistant" "node"
    fi

    # updating node common requires testing everything using it
    if [[ $file == common/node/common/* ]]
    then
        include_project "node_common" "node"

        include_project "config-server" "node"
        include_project "persistence" "node"
        include_project "voice-assistant" "node"
    fi

    # updating node common-test requires testing everything using it
    if [[ $file == common/node/common-test/* ]]
    then
        include_project "config-server" "node"
        include_project "persistence" "node"
        include_project "ui" "node"
        include_project "voice-assistant" "node"
    fi

    # updating common python/pytest requires retesting everything using python
    if [[ $file == common/python/* || $file == common/pytest/* ]]
    then
        include_project "python_common" "python"

        include_project "energenie_controller" "python"
        include_project "harmony_controller" "python"
        include_project "lifx_controller" "python"
        include_project "macro_controller" "python"
        include_project "network_controller" "python"
        include_project "node_controller" "python"
        include_project "zigbee_controller" "python"

        include_project "scheduler" "python"
    fi

    # check the controllers
    check_file $file "controllers/energenie" "energenie_controller" "python"
    check_file $file "controllers/harmony" "harmony_controller" "python"
    check_file $file "controllers/lifx" "lifx_controller" "python"
    check_file $file "controllers/macro" "macro_controller" "python"
    check_file $file "controllers/network" "network_controller" "python"
    check_file $file "controllers/node" "node_controller" "python"
    check_file $file "controllers/zigbee" "zigbee_controller" "python"

    # check the services
    check_file $file "services/config-server" "config_server" "node"
    check_file $file "services/persistence" "persistence" "node"
    check_file $file "services/scheduler" "scheduler" "python"
    check_file $file "services/ui" "ui" "node"
    check_file $file "services/voice-assistant" "voice_assistant" "node"
done < files.txt
