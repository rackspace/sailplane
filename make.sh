#!/bin/bash
# Requires one command:
# - "clean" - delete all node_modules
# - "build" - npm install, test, and build all packages
# - "check" - check what packages need to be published
# - "publish" - npm publish packages with new version numbers
# - "all" - do clean, build, & publish
COMMAND=$1

PROJECTS="expiring-value logger lambda-utils aws-https elasticsearch-client injector state-storage"

if [[ $COMMAND == clean || $COMMAND == all ]]; then
    for DIR in $PROJECTS
    do
      echo
      echo "***** Clean Package: $DIR"
      echo
      pushd $DIR || exit $?
      rm -rf node_modules
      popd || exit $?
    done
fi

if [[ $COMMAND == build || $COMMAND == all ]]; then
    # First build all - quit to avoid publishing if anything fails
    for DIR in $PROJECTS
    do
      echo
      echo "***** Build Package: $DIR"
      echo
      pushd $DIR || exit $?
      ( npm install && npm run test && npm run build) || exit $?
      popd || exit $?
    done
fi

if [[ $COMMAND == check || $COMMAND == publish || $COMMAND == all ]]; then
    for DIR in $PROJECTS
    do
      pushd $DIR || exit $?
      NAME=$(cat package.json |jq .name|tr -d '"')
      VER=$(cat package.json |jq .version|tr -d '"')
      if [[ -z "$(npm info ${NAME}@${VER} version 2>/dev/null)" ]]; then
          echo
          echo "***** Publish: ${NAME}@${VER}"
          echo
          if [[ $COMMAND != check ]]; then
              npm publish || exit $?
          fi
      else
          echo
          echo "***** Already Exists: ${NAME}@${VER}"
          echo
      fi
      popd || exit $?
    done
fi

exit 0
