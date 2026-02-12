#!/bin/bash

scriptPath=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
source "$scriptPath/services_utils.sh"

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

    # check if the file matches a common library
    check_library() {
        if file_matches_library "$file" "$LIB_NAME"
        then
            # include the library itself
            local lib_output=$(echo "$LIB_NAME" | tr '-' '_')
            include_project "$lib_output" "$LIB_TYPE"

            # include all dependants
            include_dependant() {
                local output_name="$SERVICE_NAME"
                if [ "$SERVICE_CHART" != "null" ] && [ "$SERVICE_CHART" != "~" ]
                then
                    output_name="$SERVICE_CHART"
                fi
                output_name=$(echo "$output_name" | tr '-' '_')

                include_project "$output_name" "$SERVICE_TYPE"
            }

            foreach_dependant "$LIB_NAME" include_dependant
        fi
    }

    foreach_library check_library

    # check the services, controllers and sensors
    check_from_yaml() {
        local output_name="$SERVICE_NAME"
        if [ "$SERVICE_CHART" != "null" ] && [ "$SERVICE_CHART" != "~" ]
        then
            output_name="$SERVICE_CHART"
        fi
        output_name=$(echo "$output_name" | tr '-' '_')

        check_file $file "$SERVICE_DIR" "$output_name" "$SERVICE_TYPE"
    }

    foreach_service check_from_yaml
    foreach_sensor check_from_yaml
done < files.txt
