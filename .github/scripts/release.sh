#!/bin/bash

# setup Git
git config user.name github-actions
git config user.email github-actions@github.com

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
    set -e
fi

# upload chart to GitHub releases
echo "Creating Release"
./cr upload \
    --owner "$owner" \
    --git-repo "$repo" \
    --release-name-template "v{{ .Version }}"
if [ $? -ne 0 ]
then
    set -e
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
    set -e
fi
