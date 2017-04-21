const {seed}           = require('./lib/random');
const {dummyAccessLog} = require('./lib/dummy/access_log');

seed(1);

const numOfLines    = 10;
const numOfUsers    = 100;
const keysOfCrudReq = ['products', 'comments'];
const dateRange     = [new Date(), new Date()];
const accessLog     = dummyAccessLog({numOfLines, numOfUsers, keysOfCrudReq, dateRange});

console.log(JSON.stringify(accessLog));
