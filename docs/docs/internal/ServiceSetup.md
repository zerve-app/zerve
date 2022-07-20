# Setting up the Zerve Service

At the core of Zerve are two persistent servers:

- Aardvark - build, test and deployment server (it can break occasionally)
- Zebra - production server (it should never break)

Both VPS are created by hand. The dev team has root access to Aardvark, who has root access to Zebra

## Aardvark Machine Setup

Create a Debian 11 VPS on your host (DigitalOcean), with at least 2GB of RAM

With your DNS host (aka CloudFlare) Set up a A record from `aardvark.zerve.dev` to the IP of your new server

Add the SSH public from your dev computer to `/root/.ssh/authorized_keys`

Configure the your dev computer `~/.ssh/config` to access the root user of `aardvark`

```
Host aardvark
    Hostname aardvark.zerve.dev
    User root
    IdentityFile /Users/ericvicenti/aardvark/ServerKey
```

Now you should be able to log in as root to aardvark from your dev machine with `ssh aardvark`

## Aardvark Base

```
apt update
apt upgrade -y
apt install -y mosh git

ssh-keygen -f /root/.ssh/id_rsa -N ''

git config --global init.defaultBranch main
```

... bunch of missing steps here, getting basic dependencies...

check out headless zerve repo to /root/zerve.git

create aardvark-update
