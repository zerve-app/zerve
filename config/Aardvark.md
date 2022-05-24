to update aardvark service:

ssh root@aardvark.zerve.dev -i ~/aardvark/ServerKey

cd /root/zerve.git
git fetch
cd /root
git clone zerve.git aardvark-build
cd aardvark-build
./config/UpdateAardvark.sh
