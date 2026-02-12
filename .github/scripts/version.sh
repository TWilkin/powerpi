#!/bin/bash

scriptPath=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
source "$scriptPath/services_utils.sh"

helmPath="$scriptPath/../../kubernetes/Chart.yaml"

help() {
    echo "PowerPi version script"
    echo ""
    echo "  -h|--help                            Show this help document."
    echo "  -s|--service service                 The name of the service to version."
    echo "  -v|--version major|minor|patch       The part of the service version to increase, default patch."
    echo "  -k|--chart-version major|minor|patch The part of the chart version to increase."
    echo "  -t|--type rc|release                 Service version type: rc (default) or release."
    echo "                                       rc creates a release candidate, release promotes to a full version."
    echo "  -r|--release                         Whether to perform a release."
    echo "                                       -k will be the Helm chart version and -v will be the PowerPi version."
    echo "  -c|--commit                          Whether to commit the version change."
    exit
}

update_release() {
    local versionPart=$1
    local chartPart=$2
    local commit=$3

    # find the helm version
    get_version $helmPath
    powerpiVersion=$appVersion
    helmVersion=$chartVersion
    echo "Found v$powerpiVersion of PowerPi"
    echo "Found v$helmVersion of helm chart"

    # increase PowerPi version
    powerpiVersion=$(increase_version_number "$powerpiVersion" "$versionPart")
    echo "Increasing PowerPi to v$powerpiVersion"

    # increase the chart version
    helmVersion=$(increase_version_number "$helmVersion" "$chartPart")
    echo "Increasing helm chart to v$helmVersion"
    set_chart_version $helmPath $powerpiVersion $helmVersion

    # commit the change if enabled
    if $commit
    then
        echo "Committing version changes"
        git commit -m "chore: Bump PowerPi to v$powerpiVersion"
    fi
}

update_version() {
    local service=$1
    local versionPart=$2
    local chartPart=$3
    local commit=$4

    if ! get_service_by_name "$service"
    then
        echo "Cannot find service $service"
        help
    fi

    local appPath="$scriptPath/../../$SERVICE_DIR"
    local serviceName="$SERVICE_CHART"
    local hasChart=true

    if [ "$serviceName" = "null" ] || [ "$serviceName" = "~" ]
    then
        hasChart=false
    fi

    if $hasChart
    then
        local subchartPath="$scriptPath/../../kubernetes/charts/$serviceName/Chart.yaml"

        # find the service version from the subchart
        get_version $subchartPath
        subchartVersion=$chartVersion
        echo "Found v$appVersion of service $service"
        echo "Found v$subchartVersion of helm subchart $service"
    else
        # find the service version from the source files
        appVersion=$(get_source_version $appPath)
        echo "Found v$appVersion of service $service"
    fi

    # increase the service version
    if [ "$versionType" = "rc" ]
    then
        appVersion=$(create_rc_version "$appVersion" "$versionPart")
    else
        appVersion=$(increase_version_number "$appVersion" "$versionPart")
    fi
    echo "Increasing service $service to v$appVersion"
    update_service_version $appPath $appVersion

    if $hasChart
    then
        # increase the subchart version
        subchartVersion=$(increase_version_number "$subchartVersion" "$chartPart")
        echo "Increasing helm subchart $service to v$subchartVersion"
        set_chart_version $subchartPath $appVersion $subchartVersion
        set_chart_dependency_version $helmPath $serviceName $subchartVersion
    fi

    # commit the change if enabled
    if $commit
    then
        echo "Committing version changes"
        git commit -m "chore: Bump $service to v$appVersion"
    fi
}

get_version() {
    local path=$1

    appVersion=`yq .appVersion $path | tr -d \"`
    chartVersion=`yq .version $path  | tr -d \"`
}

set_chart_version() {
    local path=$1
    local appVersion=$2
    local chartVersion=$3

    yq -i -y ".appVersion = \"$appVersion\"" $path
    yq -i -y ".version = \"$chartVersion\"" $path

    git add $path
}

set_chart_dependency_version() {
    local path=$1
    local service=$2
    local subchartVersion=$3

    yq -i -y "(.dependencies[] | select(.name == \"$service\").version) = \"$subchartVersion\"" $path

    git add $path
}

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

    echo "Could not find version for service"
    exit 1
}

update_service_version() {
    local path=$1
    local version=$2

    # check package.json
    local file="$path/package.json"
    if [ -f "$file" ]
    then
        temp=`mktemp`
        jq --indent 4 ".version = \"$version\"" $file > $temp
        mv $temp $file
        git add $file
        return
    fi

    # check pyproject.toml
    file="$path/pyproject.toml"
    if [ -f "$file" ]
    then
        sed -i "s/version = \".*\"/version = \"$version\"/" $file
        git add $file
        return
    fi

    # check configure.ac
    file="$path/configure.ac"
    if [ -f "$file" ]
    then
        sed -i "s/\(AC_INIT(\[.*\], \[\).*\]/\1$version]/" $file
        git add $file
        return
    fi

    # check Makefile
    file="$path/Makefile"
    if [ -f "$file" ]
    then
        sed -i "s/^VERSION=.*/VERSION=$version/" $file
        git add $file
        return
    fi

    echo "Could not find service"
    help
}

validate_version_part() {
    local service=$1
    local versionPart=$2

    case $versionPart in
        major|minor|patch) echo "Attempting to increase $versionPart version of $service" ;;
        *) echo "Unrecognised version part '$versionPart'" ; help ;;
    esac
}

# the default values
service=powerpi
versionPart=patch
versionType=rc
release=false
commit=false

# extract the command line arguments
while [[ $# -gt 0 ]]
do
    case $1 in
        -s|--service)
            service="$2"
            shift
            shift
            ;;

        -v|--version)
            versionPart="$2"
            validate_version_part $service $versionPart
            shift
            shift
            ;;

        -k|--chart-version)
            chartVersionPart="$2"
            validate_version_part "$service chart" $chartVersionPart
            shift
            shift
            ;;

        -t|--type)
            versionType="$2"
            shift
            shift
            ;;

        -r|--release)
            release=true
            shift
            ;;

        -c|--commit)
            commit=true
            shift
            ;;

        -h|--help)
            help
            ;;

        -*|--*)
            help
            ;;
    esac
done

if $release
then
    update_release "$versionPart" "$chartVersionPart" "$commit"
else
    update_version "$service" "$versionPart" "$chartVersionPart" "$commit"
fi
