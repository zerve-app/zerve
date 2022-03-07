// chaos activity log, move to a better place

// $10/mo DO server w/

apt update
apt upgrade -y
apt install -y mosh

// can now mosh chaos

apt update
apt upgrade -y
apt install -y git

ssh-keygen -f /root/.ssh/id_rsa -N ''

# Now go use /root/.ssh/id_rsa.pub in the repo deployment key

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
