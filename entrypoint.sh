#!/usr/bin/env bash

set -xe

envsubst "\$KISTLBOARD_API_URL" < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
nginx -t && nginx -g "daemon off;"
