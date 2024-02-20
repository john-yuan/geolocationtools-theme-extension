#!/bin/bash

readonly DIR=$(cd $(dirname $0)/.. && pwd)

cd $DIR

./packages/theme-script/scripts/build.sh

cd $DIR

rm -rf ./packages/theme-extension/extensions/geolocationtools-theme-extension/assets

mv ./packages/theme-script/releases/assets ./packages/theme-extension/extensions/geolocationtools-theme-extension/assets
