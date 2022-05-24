#!/usr/bin/env bash

: '
Steps to run this script:

cd /root/zerve.git
git fetch
cd /root
git clone zerve.git aardvark-build
cd aardvark-build
./config/UpdateAardvark.sh

'

yarn

rm -rf yarn-package-cache ./.git

yarn workspace zoo-web build
yarn workspace aardvark-server build


systemctl stop AardvarkWeb.service
systemctl stop AardvarkServer.service

cd /root
mv aardvark aardvark-old
mv aardvark-build aardvark
cp secrets.json aardvark/secrets.json

systemctl start AardvarkWeb.service
systemctl start AardvarkServer.service

systemctl status AardvarkWeb.service
systemctl status AardvarkServer.service

rm -rf aardvark-old
