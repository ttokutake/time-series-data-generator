const {seed}           = require('./lib/random');
const {dummyAccessLog} = require('./lib/dummy/access_log');

seed(1);

const numOfUsers    = 100;
const numOfLines    = 10;
const keysOfCrudReq = ['products', 'comments'];
const accessLog     = dummyAccessLog({numOfUsers, numOfLines, keysOfCrudReq});

console.log(JSON.stringify(accessLog));
