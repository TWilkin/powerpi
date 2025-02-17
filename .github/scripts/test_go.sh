#!/bin/bash

project=$1

echo Testing $project

make TARGET_OS=linux TARGET_ARCH=amd64 test
