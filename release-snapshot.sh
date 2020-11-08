#!/bin/sh

cd docker/dev
docker-compose run --rm release npm run release -- patch --ci --preRelease=SNAPSHOT --no-git.tag --no-npm
