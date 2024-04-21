#!/usr/bin/env bash

npm run build && 
docker build --platform linux/amd64 -t podscripts-react-linux . &&
docker save -o podscripts-react-linux.tar podscripts-react-linux &&
mv podscripts-react-linux.tar /Volumes/rss_to_whisper/
