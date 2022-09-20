#!/bin/bash

set -eu

if [ ! $# -eq 2 ]
then
    printf "[Usage] ./setup.sh {USER} {PASSWORD}\n"
    exit 1
fi

cd "$(dirname "$0")"

MYSQL_USER=$1
MYSQL_PASSWORD=$2
MYSQL_DATABASE="atcoder_problems"

# create database
mysql -u"${MYSQL_USER}" -p"${MYSQL_PASSWORD}" -e "CREATE DATABASE IF NOT EXISTS ${MYSQL_DATABASE} DEFAULT CHARACTER SET utf8mb4;"

# replace dummy config
if [ "$(uname)" == "Darwin" ]
then
    SED_COMMAND='sed -i .bak'
else
    SED_COMMAND='sed -i'
fi
${SED_COMMAND} "s/__REPLACE_TO_MYSQL_USER__/${MYSQL_USER}/g" config/database.json
${SED_COMMAND} "s/__REPLACE_TO_MYSQL_PASSWORD__/${MYSQL_PASSWORD}/g" config/database.json

# install npm packages
yarn

# run migration
yarn db:migrate

# seed problems data
printf "Fetching problem data. It may take a while.\n"
node crawl.js

printf "Completed setup!\n"