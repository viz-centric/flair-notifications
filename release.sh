#!/bin/sh

RELEASE_COMMAND=$1

if [ -z "$RELEASE_COMMAND" ]
then
    RELEASE_COMMAND="patch"
    echo "\$RELEASE_COMMAND is empty"
else
    echo "\$RELEASE_COMMAND is NOT empty"
fi

cd docker/dev
docker-compose run --rm release npm run release -- ${RELEASE_COMMAND} --ci