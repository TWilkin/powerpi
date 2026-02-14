#!/bin/bash
set -e

# Determine script directory for services.yaml location
_SERVICES_UTILS_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
SERVICES_YAML="${SERVICES_YAML:-$_SERVICES_UTILS_DIR/services.yaml}"

# Verify services.yaml exists
if [ ! -f "$SERVICES_YAML" ]
then
    echo "Error: services.yaml not found at $SERVICES_YAML" >&2
    exit 1
fi

#=============================================================================
# Service List Functions
#=============================================================================

# Get all service chart names
get_service_charts() {
    yq -r '.services[].chartName' "$SERVICES_YAML"
}

# Get all controller chart names
get_controller_charts() {
    yq -r '.controllers[].chartName' "$SERVICES_YAML"
}

# Get all chart names (services + controllers)
get_all_charts() {
    yq -r '(.services + .controllers)[].chartName' "$SERVICES_YAML"
}

# Get service info by chart name
# Usage: get_service_by_chart "api" -> sets SERVICE_DIR, SERVICE_NAME, SERVICE_TYPE
get_service_by_chart() {
    local chart=$1
    local result=$(yq -r "(.services + .controllers)[] | select(.chartName == \"$chart\")" "$SERVICES_YAML")

    if [ -z "$result" ] || [ "$result" = "null" ]
    then
        return 1
    fi

    SERVICE_DIR=$(echo "$result" | yq -r '.directory')
    SERVICE_NAME=$(echo "$result" | yq -r '.name')
    SERVICE_TYPE=$(echo "$result" | yq -r '.type')
    SERVICE_CHART=$(echo "$result" | yq -r '.chartName')

    return 0
}

# Get service info by name
# Usage: get_service_by_name "api" -> sets SERVICE_DIR, SERVICE_CHART, SERVICE_TYPE
get_service_by_name() {
    local name=$1
    local result=$(yq -r "(.services + .controllers + .sensors)[] | select(.name == \"$name\")" "$SERVICES_YAML")

    if [ -z "$result" ] || [ "$result" = "null" ]
    then
        return 1
    fi

    SERVICE_DIR=$(echo "$result" | yq -r '.directory')
    SERVICE_NAME=$(echo "$result" | yq -r '.name')
    SERVICE_TYPE=$(echo "$result" | yq -r '.type')
    SERVICE_CHART=$(echo "$result" | yq -r '.chartName')

    return 0
}

# Get count of services
get_service_count() {
    yq -r '.services | length' "$SERVICES_YAML"
}

# Get count of controllers
get_controller_count() {
    yq -r '.controllers | length' "$SERVICES_YAML"
}

# Iterate over all services/controllers, calling a function for each
# Usage: foreach_service my_function
foreach_service() {
    local callback=$1
    local count=$(yq -r '(.services + .controllers) | length' "$SERVICES_YAML")

    for i in $(seq 0 $((count - 1)))
    do
        SERVICE_DIR=$(yq -r "(.services + .controllers)[$i].directory" "$SERVICES_YAML")
        SERVICE_NAME=$(yq -r "(.services + .controllers)[$i].name" "$SERVICES_YAML")
        SERVICE_TYPE=$(yq -r "(.services + .controllers)[$i].type" "$SERVICES_YAML")
        SERVICE_CHART=$(yq -r "(.services + .controllers)[$i].chartName" "$SERVICES_YAML")

        $callback
    done
}

# Iterate over sensors
foreach_sensor() {
    local callback=$1
    local count=$(yq -r '.sensors | length' "$SERVICES_YAML")

    for i in $(seq 0 $((count - 1)))
    do
        SERVICE_DIR=$(yq -r ".sensors[$i].directory" "$SERVICES_YAML")
        SERVICE_NAME=$(yq -r ".sensors[$i].name" "$SERVICES_YAML")
        SERVICE_TYPE=$(yq -r ".sensors[$i].type" "$SERVICES_YAML")
        SERVICE_CHART=$(yq -r ".sensors[$i].chartName" "$SERVICES_YAML")

        $callback
    done
}

#=============================================================================
# Library Functions
#=============================================================================

# Iterate over all libraries, calling a function for each
# Usage: foreach_library my_function
# Sets: LIB_NAME, LIB_TYPE
foreach_library() {
    local callback=$1
    local count=$(yq -r '.libraries | length' "$SERVICES_YAML")

    for i in $(seq 0 $((count - 1)))
    do
        LIB_NAME=$(yq -r ".libraries[$i].name" "$SERVICES_YAML")
        LIB_TYPE=$(yq -r ".libraries[$i].type" "$SERVICES_YAML")

        $callback
    done
}

# Check if a file matches any path for a given library
# Usage: file_matches_library "common/go/util.go" "go-common"
file_matches_library() {
    local file=$1
    local lib_name=$2

    local paths=$(yq -r ".libraries[] | select(.name == \"$lib_name\").paths[]" "$SERVICES_YAML")

    while IFS= read -r path
    do
        if [[ $file == "$path"/* ]] || [[ $file == "$path" ]]
        then
            return 0
        fi
    done <<< "$paths"

    return 1
}

# Iterate over all services/controllers/sensors that depend on a given library
# Usage: foreach_dependant "go-common" my_function
# Sets: SERVICE_DIR, SERVICE_NAME, SERVICE_TYPE, SERVICE_CHART
foreach_dependant() {
    local lib_name=$1
    local callback=$2
    local count=$(yq -r '(.services + .controllers + .sensors) | length' "$SERVICES_YAML")

    for i in $(seq 0 $((count - 1)))
    do
        local has_dep=$(yq -r "(.services + .controllers + .sensors)[$i].dependencies // [] | index(\"$lib_name\")" "$SERVICES_YAML")
        if [ "$has_dep" != "null" ]
        then
            SERVICE_DIR=$(yq -r "(.services + .controllers + .sensors)[$i].directory" "$SERVICES_YAML")
            SERVICE_NAME=$(yq -r "(.services + .controllers + .sensors)[$i].name" "$SERVICES_YAML")
            SERVICE_TYPE=$(yq -r "(.services + .controllers + .sensors)[$i].type" "$SERVICES_YAML")
            SERVICE_CHART=$(yq -r "(.services + .controllers + .sensors)[$i].chartName" "$SERVICES_YAML")

            $callback
        fi
    done
}

#=============================================================================
# Version Parsing Functions
#=============================================================================

# Parse a version string (supports "1.2.3" and "1.2.3-rc.1")
# Sets: VERSION_MAJOR, VERSION_MINOR, VERSION_PATCH, VERSION_RC, VERSION_IS_RC
parse_version() {
    local version=$1

    if [[ $version =~ ^([0-9]+)\.([0-9]+)\.([0-9]+)(-rc\.([0-9]+))?$ ]]
    then
        VERSION_MAJOR="${BASH_REMATCH[1]}"
        VERSION_MINOR="${BASH_REMATCH[2]}"
        VERSION_PATCH="${BASH_REMATCH[3]}"
        VERSION_RC="${BASH_REMATCH[5]:-0}"
        VERSION_IS_RC=$([[ -n "${BASH_REMATCH[4]}" ]] && echo true || echo false)

        return 0
    fi
    return 1
}

# Check if version is an RC
is_rc_version() {
    local version=$1
    [[ $version =~ -rc\.[0-9]+$ ]]
}

# Strip RC suffix from version: "1.2.3-rc.1" -> "1.2.3"
strip_rc_suffix() {
    local version=$1
    echo "${version%%-rc.*}"
}

# Bump the parsed VERSION_MAJOR/MINOR/PATCH based on bump part
# Must call parse_version first
_bump_version_part() {
    local bump_part=$1

    case $bump_part in
        major)
            VERSION_MAJOR=$((VERSION_MAJOR + 1))
            VERSION_MINOR=0
            VERSION_PATCH=0
            ;;

        minor)
            VERSION_MINOR=$((VERSION_MINOR + 1))
            VERSION_PATCH=0
            ;;

        patch)
            VERSION_PATCH=$((VERSION_PATCH + 1))
            ;;
    esac
}

# Create/increment RC version
# Usage: create_rc_version "1.2.3" "patch" -> "1.2.4-rc.1"
#        create_rc_version "1.2.4-rc.1" "patch" -> "1.2.4-rc.2"
create_rc_version() {
    local version=$1
    local bump_part="${2:-patch}"

    parse_version "$version" || return 1

    if $VERSION_IS_RC
    then
        # Already RC, increment RC number
        VERSION_RC=$((VERSION_RC + 1))
        echo "$VERSION_MAJOR.$VERSION_MINOR.$VERSION_PATCH-rc.$VERSION_RC"
    else
        # Bump version then add -rc.1
        _bump_version_part "$bump_part"
        echo "$VERSION_MAJOR.$VERSION_MINOR.$VERSION_PATCH-rc.1"
    fi
}

# Standard version increment (no RC): "1.2.3" -> "1.2.4"
increase_version_number() {
    local version=$1
    local bump_part="${2:-patch}"

    parse_version "$version" || return 1

    # If RC, just strip the RC suffix
    if $VERSION_IS_RC
    then
        echo "$VERSION_MAJOR.$VERSION_MINOR.$VERSION_PATCH"

        return 0
    fi

    _bump_version_part "$bump_part"
    echo "$VERSION_MAJOR.$VERSION_MINOR.$VERSION_PATCH"
}

#=============================================================================
# Chart Version Functions
#=============================================================================

# Get the app and chart versions from a Chart.yaml file
# Usage: get_chart_versions "/path/to/Chart.yaml"
# Sets: CHART_APP_VERSION, CHART_VERSION
get_chart_versions() {
    local path=$1

    CHART_APP_VERSION=$(yq -r '.appVersion' "$path")
    CHART_VERSION=$(yq -r '.version' "$path")
}

#=============================================================================
# Source Version Functions
#=============================================================================

# Get the version from a service's source files
# Usage: get_source_version "/path/to/service" -> prints version string
get_source_version() {
    local path=$1

    # check package.json
    local file="$path/package.json"
    if [ -f "$file" ]
    then
        jq -r '.version' "$file"
        return
    fi

    # check pyproject.toml
    file="$path/pyproject.toml"
    if [ -f "$file" ]
    then
        grep -oP 'version = "\K[^"]+' "$file"
        return
    fi

    # check configure.ac
    file="$path/configure.ac"
    if [ -f "$file" ]
    then
        grep -oP 'AC_INIT\(\[.*\],\s*\[\K[^\]]+' "$file"
        return
    fi

    # check Makefile
    file="$path/Makefile"
    if [ -f "$file" ]
    then
        grep -oP '^VERSION=\K.*' "$file"
        return
    fi

    return 1
}
