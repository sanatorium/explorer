var express = require('express')
    path = require('path'),
    coinnodeapi = require('./lib/coin-node-api'), //// modmod
    timeconvert = require('./lib/unixtime2date'), //// modmod
    RpcClient = require('node-json-rpc2').Client, //// modmod
    favicon = require('static-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    settings = require('./lib/settings'),
    routes = require('./routes/index'),
    explorerapi = require('./lib/explorerapi'),
    db = require('./lib/database'),
    locale = require('./lib/locale'),
    checkport = require('./lib/portchecker'),
    request = require('request');

var app = express();

// bitcoinapi
//// bitcoinapi.setWalletDetails(settings.wallet);

// coinnodeapi
coinnodeapi.setWalletDetails(settings.wallet);

// used for extending with masternode commmands
var client = new RpcClient(settings.wallet); //// modmod

if (settings.heavy != true) {
  coinnodeapi.setAccess('only',
  [
    'getinfo',
    'getnetworkhashps',
    'getmininginfo',
    'getdifficulty',
    'getconnectioncount',
    'getmasternodelist',
    'getmasternodelist_addr',
    'getmasternodelist_full',
    'getmasternodelist_info',
    'getmasternodelist_activeseconds',
    'getmasternodelist_lastseen',
    'getmasternodelist_status',
    'getmasternodelist_pubkey',
    'getmasternodecount',
    'getmasternodecountonline',
    'getmasternodelist',
    'getvotelist',
    'getblockcount',
    'getblockhash',
    'getblock',
    'getrawtransaction',
    'getpeerinfo',
    'gettxoutsetinfo'
  ]);
} else {
  // enable additional heavy api calls
  /*
    getvote - Returns the current block reward vote setting.
    getmaxvote - Returns the maximum allowed vote for the current phase of voting.
    getphase - Returns the current voting phase ('Mint', 'Limit' or 'Sustain').
    getreward - Returns the current block reward, which has been decided democratically in the previous round of block reward voting.
    getnextrewardestimate - Returns an estimate for the next block reward based on the current state of decentralized voting.
    getnextrewardwhenstr - Returns string describing how long until the votes are tallied and the next block reward is computed.
    getnextrewardwhensec - Same as above, but returns integer seconds.
    getsupply - Returns the current money supply.
    getmaxmoney - Returns the maximum possible money supply.
  */
  coinnodeapi.setAccess('only',
  [
    'getinfo',
    'getstakinginfo',
    'getnetworkhashps',
    'getdifficulty',
    'getconnectioncount',
    'getmasternodecount',
    'getmasternodecountonline',
    'getmasternodelist',
    'getmasternodelist_addr',
    'getmasternodelist_full',
    'getmasternodelist_info',
    'getmasternodelist_activeseconds',
    'getmasternodelist_lastseen',
    'getmasternodelist_status',
    'getmasternodelist_pubkey',
    'getvotelist',
    'getblockcount',
    'getblockhash',
    'getblock',
    'getrawtransaction',
    'getmaxmoney',
    'getvote',
    'getmaxvote',
    'getphase',
    'getreward',
    'getpeerinfo',
    'getnextrewardestimate',
    'getnextrewardwhenstr',
    'getnextrewardwhensec',
    'getsupply',
    'gettxoutsetinfo'
  ]);
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(path.join(__dirname, settings.favicon)));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// routes
/*
app.use('/api/getmasternodes', function(req, res) { //// modmod
  explorerapi.get_masternodelist_full(function(api_data){
    console.log("**************masternodeslist_xxxx:", api_data);
  });
  var mn = function(mnp) {
    client.call({method: 'masternode', params: mnp}, function(ierr, ires) {
      if (ierr) {
        console.log(ierr);
        return;
      }
      console.log("############*masternodeslist_xxxx:", ires);
      res.send(ires.result);
    });
  }

  mn(
    [
      'list',
      'pubkey'
    ])
});
*/
app.use('/api', coinnodeapi.app);
app.use('/', routes);

/*
}
*/
// request send from masternodes.jade
app.use('/ext/getmasternodelist_full', function(req,res){
    explorerapi.get_masternodelist_full(function(api_data){ // request to ./lib/explorerapi.js
      // console.log("APPAPP*masternodeslist_full*:", api_data);
      // return object "pubkey": "value" with value = "status protocol payee lastseen activeseconds lastpaidtime lastpaidblock IP"

      /*
      Available modes:
      activeseconds  - Print number of seconds masternode recognized by the network as enabled (since latest issued "masternode start/start-many/start-alias")
      addr           - Print ip address associated with a masternode (can be additionally filtered, partial match)
      full           - Print info in format 'status protocol payee lastseen activeseconds lastpaidtime lastpaidblock IP'
      info           - Print info in format 'status protocol payee lastseen activeseconds sentinelversion sentinelstate IP'
      lastpaidblock  - Print the last block height a node was paid on the network
      lastpaidtime   - Print the last time a node was paid on the network
      lastseen       - Print timestamp of when a masternode was last seen on the network
      payee          - Print Sanity address associated with a masternode
      protocol       - Print protocol of a masternode (can be additionally filtered, exact match)
      pubkey         - Print the masternode (not collateral) public key
      rank           - Print rank of a masternode based on current block
      status         - Print masternode status: PRE_ENABLED / ENABLED / EXPIRED / WATCHDOG_EXPIRED / NEW_START_REQUIRED / UPDATE_REQUIRED / POSE_BAN / OUTPOINT_SPENT (can be additionally filtered, partial match)
      */

      // push key/value-store to array
      let mnlist = [];
      Object.keys(api_data).forEach(function( key ) {
        let valueraw = api_data[key]; // raw string with list of elements split by space: 'status protocol payee lastseen activeseconds lastpaidtime lastpaidblock IP'

        if (typeof valueraw === 'string' || valueraw instanceof String) { // check for string
          let valuearr = valueraw.toString().trim();
          valuearr = ''+valuearr.replace(/ +(?= )/g,''); // replace multiple space with only one
          valuearr = valuearr.toString().split(" ");

          //console.log("APPAPP>>>key:: ", key);
          //console.log("APPAPP>>>valraw:: ", valueraw);
          //console.log("APPAPP>>>valarr:: ", valuearr);
          //console.log("APPAPP>>>arrlen:: ", valuearr.length);

          let convdate = timeconvert.unixtime2date(valuearr[3]);
          let convsecs = timeconvert.seconds2days(valuearr[4]);
          //console.log("APPAPP", valuearr[3], convdate);

          mnlist.push({
              'key': key,
              'valueraw': valueraw,
              'status': valuearr[0],
              'protocol': valuearr[1],
              'payee': valuearr[2],
              'lastseen': valuearr[3],
              'lastseenreadable': convdate,
              'activeseconds': valuearr[4],
              'activesecondsreadable': convsecs,
              'lastpaidtime': valuearr[5],
              'lastpaidblock': valuearr[6],
              'ip': valuearr[7],
          });
        }
      });
      //mnlist[i]['test'] = api_data[i]; // format_unixtime(json.data[i]['timestamp']);
      //json.data[i]['timestamp'] = new Date((json.data[i]['timestamp']) * 1000).toUTCString();
      //console.log("APPAPP>>>arrlen:: ", mnlist.length);
      if (mnlist === 0)
      mnlist.push({
          'key': '',
          'valueraw': '',
          'status': '',
          'protocol': '',
          'payee': '',
          'lastseen': '',
          'activeseconds': '',
          'lastpaidtime': '',
          'lastpaidblock': '',
          'ip': '',
      });
      res.send( {data: mnlist} ); // return to masternode.jade
    });
});

// request send from masternodes.jade to ping a masternode-ip
app.use('/ext/checkport/:host/:port', function(req, res) { //// modmod
  checkport.is_open(req.param('host'), req.param('port'), function(perror, pstatus) { // call
    //console.log("checkport::", pstatus);
    res.send(pstatus == 'open' ? 'true' : 'false'); // return true or false to masternode.jade
  });
});

app.use('/ext/getmoneysupply', function(req,res){
  explorerapi.get_supply(function(supply){
    res.send(' '+supply);
  });
});

app.use('/ext/getaddress/:hash', function(req,res){
  db.get_address(req.param('hash'), function(address){
    if (address) {
      var a_ext = {
        address: address.a_id,
        sent: (address.sent / 100000000),
        received: (address.received / 100000000),
        balance: (address.balance / 100000000).toString().replace(/(^-+)/mg, ''),
        last_txs: address.txs,
      };
      res.send(a_ext);
    } else {
      res.send({ error: 'address not found.', hash: req.param('hash')})
    }
  });
});

app.use('/ext/getbalance/:hash', function(req,res){
  db.get_address(req.param('hash'), function(address){
    if (address) {
      res.send((address.balance / 100000000).toString().replace(/(^-+)/mg, ''));
    } else {
      res.send({ error: 'address not found.', hash: req.param('hash')})
    }
  });
});

app.use('/ext/getdistribution', function(req,res){
  db.get_richlist(settings.coin, function(richlist){
    db.get_stats(settings.coin, function(stats){
      db.get_distribution(richlist, stats, function(dist){
        res.send(dist);
      });
    });
  });
});

app.use('/ext/getlasttxs/:min', function(req,res){
  db.get_last_txs(settings.index.last_txs, (req.params.min * 100000000), function(txs){
    res.send({data: txs});
  });
});

app.use('/ext/connections', function(req,res){
  db.get_peers(function(peers){
    res.send({data: peers});
  });
});

// locals
app.set('title', settings.title);
app.set('symbol', settings.symbol);
app.set('coin', settings.coin);
app.set('locale', locale);
app.set('display', settings.display);
app.set('markets', settings.markets);
app.set('twitter', settings.twitter);
app.set('facebook', settings.facebook);
app.set('googleplus', settings.googleplus);
app.set('bitcointalk', settings.bitcointalk);
app.set('slack', settings.slack);
app.set('discord', settings.discord);
app.set('github', settings.github);
app.set('website', settings.website);
app.set('genesis_block', settings.genesis_block);
app.set('index', settings.index);
app.set('heavy', settings.heavy);
app.set('txcount', settings.txcount);
app.set('nethash', settings.nethash);
app.set('nethash_units', settings.nethash_units);
app.set('show_sent_received', settings.show_sent_received);
app.set('logo', settings.logo);
app.set('theme', settings.theme);
app.set('labels', settings.labels);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
