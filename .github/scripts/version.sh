#!/bin/bash

scriptPath=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

help() {
    echo "PowerPi version script"
    echo "expects 'bash version.sh service part"
    echo "  service: one of the PowerPi services"
    echo "  part: major|minor|macro"
    exit
}

update_version() {
    local service=$1
    local versionPart=$2

    local appPath="$scriptPath/../../services/$service"
    local subchartPath="$scriptPath/../../kubernetes/charts/$service/Chart.yaml"
    echo $appPath
    echo $subchartPath
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

    # find the helm version
    helmPath="$scriptPath/../../kubernetes/Chart.yaml"
    get_version $helmPath
    powerpiVersion=$appVersion
    helmVersion=$chartVersion
    echo "Found v$powerpiVersion of PowerPi"
    echo "Found v$helmVersion of helm chart"

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
    increase_version $subchartVersion "macro"
    subchartVersion=$newVersion
    echo "Increasing helm subchart $service to v$subchartVersion"
    set_chart_version $subchartPath $appVersion $subchartVersion

    # increase PowerPi version
    increase_version $powerpiVersion "macro"
    powerpiVersion=$newVersion
    echo "Increasing PowerPi to v$powerpiVersion"

    # increase the chart version
    increase_version $helmVersion "macro"
    helmVersion=$newVersion
    echo "Increasing helm chart to v$helmVersion"
    set_chart_version $helmPath $powerpiVersion $helmVersion $service $subchartVersion

    # commit the change
    echo "Committing version changes"
    git commit -m "Bump $service to v$appVersion"
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
    local service=$4
    local subchartVersion=$5

    yq e -i ".appVersion = \"$appVersion\"" $path
    yq e -i ".version = \"$chartVersion\"" $path

    if [ ! -z $subchartVersion ]
    then
        yq e -i "(.dependencies[] | select(.name == \"$service\").version) = \"$subchartVersion\"" $path
    fi

    git add $path
}


increase_version() {
    local version=$1
    local versionPart=$2

    IFS="." read -r -a array <<< "$version"
    major="${array[0]}"
    minor="${array[1]}"
    macro="${array[2]}"

    if [ $versionPart = "major" ]
    then
        major=$(($major+1))
        minor=0
        macro=0
    elif [ $versionPart = "minor" ]
    then
        minor=$(($minor+1))
        macro=0
    else
        macro=$(($macro+1))
    fi

    newVersion="$major.$minor.$macro"
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

if [ $# -ne 2 ]
then
    help
fi

service=$1
versionPart=$2 # major, minor, macro

# validate the version part
case $versionPart in
    major|minor|macro) echo "Attempting to increase $versionPart version of service $service" ;;
    *) echo "Unrecognised version part $versionPart" ; help ;;
esac

update_version $service $versionPart
