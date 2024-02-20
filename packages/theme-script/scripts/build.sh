#!/bin/bash

readonly DIR=$(cd $(dirname $0)/.. && pwd)

cd $DIR

pnpm build

cd $DIR

rm -rf releases
mkdir releases

mv dist/flags releases/assets
cp dist/assets/bundle.js releases/assets/main.js
cp dist/assets/index.css releases/assets/main.css
