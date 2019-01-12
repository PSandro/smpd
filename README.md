# smpd
simple minecraft packet decoder

This little node app lets you see the values of a given packet data (hex). Currently there is only the Handshake packet supported, but other uncompromised packets will follow soon.
### How to use?
```
git clone git@github.com:PSandro/smpd.git
cd smpd
npm install
node index.js
```
### What it looks like
Getting hex packet data in wireshark...
![grafik](https://user-images.githubusercontent.com/20563761/51077888-bba74b80-16ac-11e9-89b7-a98755779f9a.png)

Inserting this data in smpd...

![grafik](https://user-images.githubusercontent.com/20563761/51077961-1f7e4400-16ae-11e9-9586-5118ce56274d.png)
