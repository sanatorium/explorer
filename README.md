Sanity Blockexplorer - 1.7.1
================

The Sanity block explorer.

## see it in action

*  [explorer.masternode.mn](https://explorer.masternode.mn)

## requires

*  node.js >= 0.10.28
*  mongodb 2.6.x
*  sanityd
*  sanity-cli



## install sanity wallet

#### Wallet

The wallet connected to the block explorer must be running with at least the following flags:

    sanityd -daemon -txindex

#### or in sanity.conf

    txindex=1
    deamon=1




## install npm and node
    sudo apt-get update

    sudo apt-get install nodejs

    sudo apt-get install npm

    sudo apt install nodejs-legacy

    nodejs -v

    npm -v

### update npm and node to latest stable

    sudo npm cache clean -f

    sudo npm install -g n

    sudo n stable

    nodejs -v

    npm -v


## install mongodb
    sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927

    echo "deb http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list

    sudo apt-get update

    sudo apt-get install -y mongodb-org

    sudo nano /etc/systemd/system/mongodb.service

    	[Unit]
    	Description=High-performance, schema-free document-oriented database
    	After=network.target

    	[Service]
    	User=mongodb
    	ExecStart=/usr/bin/mongod --quiet --config /etc/mongod.conf

    	[Install]
    	WantedBy=multi-user.target

#### start service
    sudo systemctl start mongodb

#### check status
    sudo systemctl status mongodb

#### enable permanently
    sudo systemctl enable mongodb

### create database

#### start mongo (cli)
    mongo

#### create db
    use explorerdb1

#### create user
    db.createUser( { user: "sanitydb1", pwd: "sanitydb1", roles: [ "readWrite" ] } )

#### check user
    db.getUsers()

#### exit
    CTRL+c


#### check mongo
    ps -ax | grep mongo



## install explorer

#### get the source

    cd

    git clone https://github.com/sanatorium/explorer

#### install node modules
    cd explorer && npm install --production

#### configure explorer

    cp ~/explorer/settings.json.template ~/explorer/settings.json

    nano ~/explorer/settings.json

*Make required changes in settings.json*

#### install forever
    sudo npm install forever --global

    sudo npm install forever-monitor



#### testing only
##### start without daemon
    cd ~/explorer && npm start
##### or
    cd ~/explorer && sudo forever start bin/cluster

##### to check
    forever list

##### to view log
    forever logs

##### to stop
    forever stop bin/cluster
##### or
    forever stopall



### update blockindex
#### first index
    cd ~/explorer && node scripts/sync.js index reindex

#### update manually
    cd explorer && node scripts/sync.js index update


## make installation permanent

#### edit crone for current user (i.e. sanitycore)

crontab -e

    # delete explorer lock on reboot
    @reboot /home/sanitycore/explorer/tmp/index.pid > /dev/null 2>&1
    # start sanity on reboot
    @reboot sleep 15; /home/sanitycore/.sanitycore/sanityd -daemon -txindex
    # start explorer on reboot
    @reboot cd /home/sanitycore/explorer && /usr/local/bin/forever start -a -c /usr/local/bin/node --plain --silent --minUptime 1000 --spinSleep 1000 bin/cluster
    # delete explorer lock every 59 min
    */59 * * * * /home/sanitycore/explorer/tmp/index.pid > /dev/null 2>&1
    # update blocks every 2 min
    */2 * * * * cd /home/sanitycore/explorer && /usr/local/bin/node scripts/sync.js index update > /dev/null 2>&1
    # update markets every 7 min
    */7 * * * * cd /home/sanitycore/explorer && /usr/local/bin/node scripts/sync.js market > /dev/null 2>&1
    # update network every 13 min
    */13 * * * * cd /home/sanitycore/explorer && /usr/local/bin/node scripts/peers.js > /dev/null 2>&1

#### reboot vps
    sudo reboot





## reference

### syncing databases with the blockchain

sync.js (located in scripts/) is used for updating the local databases. This script must be called from the explorers root directory.

Usage: node scripts/sync.js [database] [mode]

database: (required)
index [mode] Main index: coin info/stats, transactions & addresses
market       Market data: summaries, orderbooks, trade history & chartdata

mode: (required for index database only)
update       Updates index from last sync to current block
check        checks index for (and adds) any missing transactions/addresses
reindex      Clears index then resyncs from genesis to current block

notes:
* 'current block' is the latest created block when script is executed.
* The market database only supports (& defaults to) reindex mode.
* If check mode finds missing data(ignoring new data since last sync),
  index_timeout in settings.json is set too low.

*It is recommended to have this script launched via a cronjob at 1+ min intervals.*

**crontab**

*Example crontab; update index every minute and market data every 2 minutes*

    */1 * * * * cd /path/to/explorer && /usr/bin/nodejs scripts/sync.js index update > /dev/null 2>&1
    */2 * * * * cd /path/to/explorer && /usr/bin/nodejs scripts/sync.js market > /dev/null 2>&1
    */5 * * * * cd /path/to/explorer && /usr/bin/nodejs scripts/peers.js > /dev/null 2>&1

forcesync.sh and forcesynclatest.sh (located in scripts/) can be used to force the explorer to sync at the specified block heights

### Wallet

The wallet connected to the block explorer must be running with at least the following flags:

    -daemon -txindex

## Known Issues

### ***script is already running.*** message on sync

If you receive this message when launching the sync script either a) a sync is currently in progress, or b) a previous sync was killed before it completed. If you are certian a sync is not in progress remove the index.pid from the tmp folder in the explorer root directory.

    rm /explorer/tmp/index.pid

### ***exceeding stack size***

    RangeError: Maximum call stack size exceeded

Nodes default stack size may be too small to index addresses with many tx's. If you experience the above error while running sync.js the stack size needs to be increased.

To determine the default setting run

    node --v8-options | grep -B0 -A1 stack_size

To run sync.js with a larger stack size launch with

    node --stack-size=[SIZE] scripts/sync.js index update

Where [SIZE] is an integer higher than the default.

*note: SIZE will depend on which blockchain you are using, you may need to play around a bit to find an optimal setting*

## License

Copyright (c) 2018, The Sanitycore Developers  
Copyright (c) 2017, The Chaincoin Community  
Copyright (c) 2015, Iquidus Technology  
Copyright (c) 2015, Luke Williams  
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of Iquidus Technology nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
