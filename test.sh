#!/bin/sh

cd docker/dev
docker-compose build
docker-compose run --rm agent
docker-compose run --rm test npm run migrate
docker-compose run --rm test
docker-compose stop
docker-compose rm -f