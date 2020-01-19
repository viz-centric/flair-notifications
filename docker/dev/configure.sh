#!/usr/bin/env bash
set -e
git config --global url."https://${token}:@github.com/".insteadOf "https://github.com/"
git config --global user.email $git_author_email
git config --global user.name $git_author_name
