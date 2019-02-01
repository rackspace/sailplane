#!/bin/bash

for DIR in expiring-value logger lambda-utils aws-https elasticsearch-client injector state-storage
do
  echo
  echo "***** Package: $DIR"
  echo
  pushd $DIR || exit $?
  ( npm install && npm run test && npm run build) || exit $?
  popd
done

cd docs
make html

