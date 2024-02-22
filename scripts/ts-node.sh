#!/bin/sh

node \
  --unhandled-rejections=strict \
  -r ./scripts/ts-node-register \
  "$@"
