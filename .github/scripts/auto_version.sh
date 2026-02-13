#!/bin/bash
set -e

scriptPath=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
source "$scriptPath/services_utils.sh"


# Run check_modified.sh and capture its output
output_file=$(mktemp)
GITHUB_OUTPUT="$output_file" bash "$scriptPath/check_modified.sh"

# Parse check_modified output into a set
declare -A modified_output
while IFS='=' read -r key value
do
    if [ "$value" = "true" ]
    then
        modified_output[$key]=1
    fi
done < "$output_file"
rm -f "$output_file"

# Check if yarn.lock specifically changed
yarn_lock_changed=""
if git diff origin/main...HEAD --name-only | grep -q '^yarn.lock$'
then
    yarn_lock_changed=1
fi

# Collect affected services for version bumping
declare -A affected_services

# Get the version of a service on main from its source files
get_main_version() {
    local service_dir=$1
    local content

    for file in package.json pyproject.toml configure.ac Makefile
    do
        content=$(git show "origin/main:$service_dir/$file" 2>/dev/null) || continue
        case $file in
            package.json)
                echo "$content" | jq -r '.version'
                return
                ;;

            pyproject.toml)
                echo "$content" | grep -oP 'version = "\K[^"]+'
                return
                ;;

            configure.ac)
                echo "$content" | grep -oP 'AC_INIT\(\[.*\],\s*\[\K[^\]]+'
                return
                ;;

            Makefile)
                echo "$content" | grep -oP '^VERSION=\K.*'
                return
                ;;
        esac
    done
}

# Add a service if it needs a version bump (version matches main)
add_if_needs_bump() {
    local service_name=$1

    if [ -n "${affected_services[$service_name]}" ]
    then
        return
    fi

    if ! get_service_by_name "$service_name"
    then
        return
    fi

    local pr_version=$(get_source_version "$scriptPath/../../$SERVICE_DIR")
    local main_version=$(get_main_version "$SERVICE_DIR")

    if [ "$pr_version" != "$main_version" ]
    then
        echo "Skipping $service_name - already bumped ($main_version -> $pr_version)"
        return
    fi

    echo "Will bump $service_name (currently $pr_version)"
    affected_services[$service_name]=1
}

# Map a yarn workspace name to service(s)
process_workspace() {
    local workspace=$1

    if get_service_by_name "$workspace"
    then
        add_if_needs_bump "$SERVICE_NAME"
        return
    fi

    # Check if it's a library (node-<name>)
    local lib_name="node-$workspace"

    add_dependants_for_library() {
        add_if_needs_bump "$SERVICE_NAME"
    }
    foreach_dependant "$lib_name" add_dependants_for_library 2>/dev/null || true
}

# Check each service/controller/sensor against check_modified outputs
check_service() {
    local output_name="$SERVICE_NAME"

    if [ "$SERVICE_CHART" != "null" ] && [ "$SERVICE_CHART" != "~" ]
    then
        output_name="$SERVICE_CHART"
    fi
    output_name=$(echo "$output_name" | tr '-' '_')

    # Skip Node.js services if yarn.lock changed — yarn why handles those
    if [ -n "$yarn_lock_changed" ] && [ "$SERVICE_TYPE" = "nodejs" ]
    then
        return
    fi

    if [ -n "${modified_output[$output_name]}" ]
    then
        add_if_needs_bump "$SERVICE_NAME"
    fi
}

foreach_service check_service
foreach_sensor check_service

# Handle Node.js services with yarn why for precision
if [ -n "$yarn_lock_changed" ]
then
    # Extract changed package names from yarn.lock diff
    packages=$(git diff origin/main...HEAD -- yarn.lock \
        | grep -oP '^\+"\K@?[^@"]+' \
        | sort -u)

    for package in $packages
    do
        echo "Checking yarn why $package"
        why_output=$(yarn why "$package" --json 2>/dev/null || true)

        workspaces=$(echo "$why_output" \
            | grep '"list"' \
            | jq -r '.data.items[]' \
            | grep 'depends on it' \
            | grep -oP '_project_#@powerpi#\K[^"]+')

        for workspace in $workspaces
        do
            process_workspace "$workspace"
        done
    done
fi

# Bump versions for affected services
service_list=""
for service_name in "${!affected_services[@]}"
do
    echo "Bumping $service_name"
    bash "$scriptPath/version.sh" --service "$service_name" --commit

    # Use chart name for label, or service name for sensors
    get_service_by_name "$service_name"
    label="$SERVICE_NAME"
    if [ "$SERVICE_CHART" != "null" ] && [ "$SERVICE_CHART" != "~" ]
    then
        label="$SERVICE_CHART"
    fi

    if [ -n "$service_list" ]
    then
        service_list="$service_list,$label"
    else
        service_list="$label"
    fi
done

echo "services=$service_list" >> "$GITHUB_OUTPUT"

if [ -z "$service_list" ]
then
    echo "No services need version bumps"
else
    echo "Bumped: $service_list"
fi
