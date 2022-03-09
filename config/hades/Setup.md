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
apt install -y caddy

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

caddy reload -config /etc/caddy/Caddyfile

yarn global add eas-cli expo-cli

as root: apt install -y zsh pu

as eric:

chsh -s $(which zsh)
