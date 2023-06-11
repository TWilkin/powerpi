#!/bin/bash

include_project() {
    local project=$1

    echo "Enabling tests for $project"
    echo "$project=true" >> $GITHUB_OUTPUT
    echo "python=true" >> $GITHUB_OUTPUT
}

check_file() {
    local file=$1
    local path=$2
    local project=$3

    if [[ $file == $path/* ]]
    then
        include_project $project
    fi
}

# iterate through the changed files
git diff --name-only HEAD^ HEAD > files.txt
while IFS= read -r file
do
    echo $file

    # updating common python/pytest requires retesting everything using python
    if [[ $file == common/python/* || $file == common/pytest/* ]]
    then
        include_project python_common

        include_project energenie_controller
        include_project harmony_controller
        include_project lifx_controller
        include_project macro_controller
        include_project network_controller
        include_project node_controller
        include_project zigbee_controller

        include_project scheduler
    fi

    # for now just make it happen
    check_file $file ".github" "lifx_controller"

    # check the controllers
    check_file $file "controllers/energenie" "energenie_controller"
    check_file $file "controllers/harmony" "harmony_controller"
    check_file $file "controllers/lifx" "lifx_controller"
    check_file $file "controllers/macro" "macro_controller"
    check_file $file "controllers/network" "network_controller"
    check_file $file "controllers/node" "node_controller"
    check_file $file "controllers/zigbee" "zigbee_controller"

    # check the services
    check_file $file "services/scheduler" "scheduler"
done < files.txt
