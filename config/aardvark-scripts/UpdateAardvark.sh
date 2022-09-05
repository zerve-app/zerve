#!/usr/bin/env bash

: '
Steps to run this script:

cd /root/zerve.git
git fetch
cd /root
rm -rf aardvark-build
git clone zerve.git aardvark-build
cd aardvark-build
./config/UpdateAardvark.sh

'

echo "====================="
echo "== UPDATE AARDVARK =="
echo "====================="

# We are in /root/aardvark-build

yarn --immutable

rm -rf yarn-package-cache ./.git
git init
git branch -m detached-main

yarn workspace zoo-web build
yarn workspace aardvark-server build

systemctl stop AardvarkWeb.service
systemctl stop AardvarkServer.service

rm -rf aardvark-old
mv /root/aardvark /root/aardvark-old
mv /root/aardvark-build /root/aardvark
cp /root/secrets.json /root/aardvark/secrets.json

systemctl start AardvarkWeb.service
systemctl start AardvarkServer.service

systemctl enable AardvarkWeb.service
systemctl enable AardvarkServer.service

systemctl status AardvarkWeb.service
systemctl status AardvarkServer.service

rm -rf /root/aardvark-old
