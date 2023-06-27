#!/bin/bash

scriptPath=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
helmPath="$scriptPath/../../kubernetes/Chart.yaml"

help() {
    echo "PowerPi version script"
    echo ""
    echo "  -h|--help                            Show this help document."
    echo "  -s|--service service                 The name of the service to version."
    echo "  -v|--version major|minor|patch       The part of the service version to increase, default patch."
    echo "  -k|--chart-version major|minor|patch The part of the chart version to increase."
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
    increase_version $powerpiVersion $versionPart
    powerpiVersion=$newVersion
    echo "Increasing PowerPi to v$powerpiVersion"

    # increase the chart version
    increase_version $helmVersion $chartPart
    helmVersion=$newVersion
    echo "Increasing helm chart to v$helmVersion"
    set_chart_version $helmPath $powerpiVersion $helmVersion

    # commit the change if enabled
    if $commit
    then
        echo "Committing version changes"
        git commit -m "Bump PowerPi to v$powerpiVersion"
    fi
}

update_version() {
    local service=$1
    local versionPart=$2
    local chartPart=$3
    local commit=$4

    local appPath="$scriptPath/../../services/$service"
    local subchartPath="$scriptPath/../../kubernetes/charts/$service/Chart.yaml"

    if [ ! -d $appPath ]
    then
        echo "Service $service is a controller"
        appPath="$scriptPath/../../controllers/$service"
        subchartPath="$scriptPath/../../kubernetes/charts/$service-controller/Chart.yaml"
    fi

    # check the service exists
    if [ ! -f $subchartPath ]
    then
        echo "Cannot find service $service"
        help
    fi

    # find the service version
    get_version $subchartPath
    subchartVersion=$chartVersion
    echo "Found v$appVersion of service $service"
    echo "Found v$subchartVersion of helm subchart $service"

    # increase the service version
    increase_version $appVersion $versionPart
    appVersion=$newVersion
    echo "Increasing service $service to v$appVersion"
    update_service_version $appPath $appVersion

    # increase the subchart version
    increase_version $subchartVersion $chartPart
    subchartVersion=$newVersion
    echo "Increasing helm subchart $service to v$subchartVersion"
    set_chart_version $subchartPath $appVersion $subchartVersion
    set_chart_dependency_version $helmPath $service $subchartVersion

    # commit the change if enabled
    if $commit
    then
        echo "Committing version changes"
        git commit -m "Bump $service to v$appVersion"
    fi
}

get_version() {
    local path=$1

    appVersion=`yq .appVersion $path`
    chartVersion=`yq .version $path`
}

set_chart_version() {
    local path=$1
    local appVersion=$2
    local chartVersion=$3

    yq e -i ".appVersion = \"$appVersion\"" $path
    yq e -i ".version = \"$chartVersion\"" $path

    git add $path
}

set_chart_dependency_version() {
    local path=$1
    local service=$2
    local subchartVersion=$3

    yq e -i "(.dependencies[] | select(.name == \"$service\").version) = \"$subchartVersion\"" $path

    git add $path
}

increase_version() {
    local version=$1
    local versionPart=$2

    IFS="." read -r -a array <<< "$version"
    major="${array[0]}"
    minor="${array[1]}"
    patch="${array[2]}"

    if [ $versionPart = "major" ]
    then
        major=$(($major+1))
        minor=0
        patch=0
    elif [ $versionPart = "minor" ]
    then
        minor=$(($minor+1))
        patch=0
    else
        patch=$(($patch+1))
    fi

    newVersion="$major.$minor.$patch"
}

update_service_version() {
    local path=$1
    local version=$2

    # check package.json
    local file="$path/package.json"
    if [ -f "$file" ]
    then
        yq -e -i -I4 -oj ".version = \"$version\"" $file
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
    update_release $versionPart $chartVersionPart $commit
else
    update_version $service $versionPart $chartVersionPart $commit
fi
