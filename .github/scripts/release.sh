#!/bin/bash

# find the new version
version_str=`grep "^version:\s*.*$" "${GITHUB_WORKSPACE}/kubernetes/Chart.yaml" | head -n 1`
version_regex="version:\s*(.*)"
if [[ $version_str =~ $version_regex ]]
then 
    version="${BASH_REMATCH[1]}"
else 
    version=-1 
fi

# if the tag already exists, don't release
tag_exists=`git tag | grep $version | wc -l`
if [ $tag_exists -ne "0" ]
then
    exit 0
fi

# donwload helm chart releaser
echo "Downloading Chart Releaser"
curl -sSLo cr.tar.gz "https://github.com/helm/chart-releaser/releases/download/v1.5.0/chart-releaser_1.5.0_linux_amd64.tar.gz"
tar -xzf cr.tar.gz
rm -f cr.tar.gz

owner=$(cut -d '/' -f 1 <<< "$GITHUB_REPOSITORY")
repo=$(cut -d '/' -f 2 <<< "$GITHUB_REPOSITORY")

# package chart
echo "Packaging Helm Chart"
./cr package "${GITHUB_WORKSPACE}/kubernetes/"
if [ $? -ne 0 ]
then
    exit 1
fi

# upload chart to GitHub releases
echo "Creating Release"
./cr upload \
    --owner "$owner" \
    --git-repo "$repo" \
    --release-name-template "v{{ .Version }}"
if [ $? -ne 0 ]
then
    exit 2
fi

# update index and push to GitHub pages
echo "Updating index"
./cr index \
    --owner "$owner" \
    --git-repo "$repo" \
    --release-name-template "v{{ .Version }}" \
    --index-path ./index.yaml \
    --pages-index-path docs/index.yaml \
    --push
if [ $? -ne 0 ]
then
    exit 3
fi
