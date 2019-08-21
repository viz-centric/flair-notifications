#!/usr/bin/env bash
sleep ${SLEEP_TIME}

node_modules/.bin/sequelize db:migrate

sleep 5

npm docker
