#!/usr/bin/env bash

cd /root/zerve.git
git fetch
cd /root
git clone zerve.git aardvark-build
cd aardvark-build
./config/UpdateAardvark.sh


yarn

rm -rf yarn-package-cache ./.git

yarn workspace zoo-web build
yarn workspace aardvark-server build


systemctl stop AardvarkWeb.service
systemctl stop AardvarkServer.service

mv aardvark aardvark-old

mv aardvark-build aardvark

cp secrets.json aardvark/secrets.json

systemctl start AardvarkWeb.service
systemctl start AardvarkServer.service

#rm -rf aardvark-old
