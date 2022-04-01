// Hades Dev Setup / Log

// $10/mo DO server w/ Debian 11

apt update
apt upgrade -y
apt install -y mosh
apt install -y git

ssh-keygen -f /root/.ssh/id_rsa -N ''

# Now go use /root/.ssh/id_rsa.pub in the repo deployment key

git config pull.rebase true
git clone git@github.com:zerve-app/zerve.git zerve

# from https://github.com/nodesource/distributions/blob/master/README.md

curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
apt-get install -y nodejs

# from https://classic.yarnpkg.com/en/docs/install/#debian-stable

npm install -g yarn

# from https://caddyserver.com/docs/install#debian-ubuntu-raspbian

apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | tee /etc/apt/trusted.gpg.d/caddy-stable.asc
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update

# add a system user, "zerve" for our server to run under.

# use "GECOS" to make this command noninteractive. it is a list of "Full name,Room number,Work phone,Home phone" but we just provide the name

adduser --disabled-password --gecos "Zerve User" zerve

cd zerve

yarn --offline

adduser eric
usermod -a -G sudo eric

su eric
cd ~
mkdir .ssh
vi .ssh/authorized_keys

# add ssh keys, yo

git config --global pull.rebase true
git config --global user.name "Eric Vicenti"
git config --global user.email "eric@vicenti.net"

ssh-keygen -f ~/.ssh/id_rsa -N ''

cat ~/.ssh/id_rsa.pub

# add key to GitHub

# set up code server

# https://coder.com/docs/code-server/latest/install#debian-ubuntu

# VERSION=4.1.0

curl -fOL https://github.com/coder/code-server/releases/download/v4.1.0/code-server_4.1.0_amd64.deb
sudo dpkg -i code-server_4.1.0_amd64.deb
sudo systemctl enable --now code-server@$USER

sudo apt install -y caddy
curl -o /usr/bin/caddy -L "https://caddyserver.com/api/download?os=linux&arch=amd64&p=github.com%2Fcaddy-dns%2Fcloudflare&idempotency=81071685807062"
chmod ugo+x /usr/bin/caddy
sudo vi /etc/systemd/system/caddy.service

# Now visit http://127.0.0.1:8080. Your password is in ~/.config/code-server/config.yaml

vi ~/.config/code-server/config.yaml

bind-addr: 127.0.0.1:9988
auth: password
password: SET_PW_HERE
cert: false

Caddyfile
sudo vi /etc/caddy/Caddyfile

hades.main.zerve.dev {
reverse_proxy 127.0.0.1:9988
}

caddy reload -config /etc/caddy/caddy.json

yarn global add eas-cli expo-cli

as root: apt install -y zsh pu

as eric:

chsh -s $(which zsh)

write secrets file to /home/eric/secrets.json

sudo hostname hades.main.zerve.dev

cd ~

git clone --bare git@github.com:zerve-app/zerve.git

# BUILD PROCESS START

# first fetch from our servers main headless repo

cd /home/eric/zerve.git
git fetch
cd /home/eric

# in theory you can build a different thing from the default clone, which is the latest main branch

git clone zerve.git z-build-03

cd z-build-03

yarn --offline

rm -rf yarn-package-cache ./.git

yarn workspace z-web build
yarn workspace z-server build

cd ..

# trailing slash is important here, I think:

tar -zcvf z-build-03.tar.gz z-build-03/

# now the build weighs about 1GB and is oversized because of the mobile stuff. but a mobile build can still run

rm -rf z-build-03

# now build is z-build-0.tar.gz at ~320MB

# BUILD PROCESS END

# DEPLOY PROCESS START

sudo tar -zvxf ./z-build-03.tar.gz -C /home/zerve/

sudo mv /home/zerve/z-build-03 /home/zerve/deploy-02

sudo cp ./z-secrets.json /home/zerve/deploy-02/secrets.json

sudo chown -R zerve:zerve /home/zerve/deploy-02

# DEPLOY PROCESS END

sudo vi /etc/systemd/system/Zerve.Server.Deploy01.service
sudo vi /etc/systemd/system/Zerve.Web.Deploy01.service

sudo systemctl daemon-reload

sudo systemctl start Zerve.Server.Deploy02.service
sudo systemctl start Zerve.Web.Deploy02.service
sudo systemctl enable Zerve.Server.Deploy02.service
sudo systemctl enable Zerve.Web.Deploy02.service

sudo journalctl -u Zerve.Server.Deploy02.service
sudo journalctl -u Zerve.Web.Deploy02.service

sudo systemctl status Zerve.Server.Deploy02.service
sudo systemctl status Zerve.Web.Deploy02.service
