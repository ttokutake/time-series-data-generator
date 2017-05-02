const {seed}           = require('./lib/random');
const {dummyAccessLog} = require('./lib/dummy/access_log');
const {
  ReqGenerator,
  CrudReqGenerator,
} = require('./lib/dummy/req_generator');
const UserGenerator = require('./lib/dummy/user_generator');
const DateGenerator = require('./lib/dummy/date_generator');

seed(1);

const reqGenerator = new ReqGenerator([
  {method: 'GET' , path: '/index', ratio: 3, statusRatio: {200: 199, 500: 1}                },
  {method: 'POST', path: '/login', ratio: 1, statusRatio: {201: 195, 400: 2, 401: 2, 500: 1}},
]);

const productsReqGenerator = new CrudReqGenerator({resource: 'products', methodRatio: {
  POST  : {ratio: 1, statusRatio: {201: 195, 400: 2, 403: 2, 500: 1}        },
  GET   : {ratio: 6, statusRatio: {200: 195, 401: 2, 403: 2, 500: 1}        },
  PUT   : {ratio: 2, statusRatio: {200: 194, 400: 2, 401: 2, 403: 2, 500: 1}},
  DELETE: {ratio: 1, statusRatio: {204: 195, 401: 2, 403: 2, 500: 1}        },
}});

const commentsReqGenerator = new CrudReqGenerator({resource: 'comments', methodRatio: {
  POST  : {ratio: 4, statusRatio: {201: 195, 400: 2, 403: 2, 500: 1}        },
  GET   : {ratio: 6, statusRatio: {200: 195, 401: 2, 403: 2, 500: 1}        },
  PUT   : {ratio: 2, statusRatio: {200: 194, 400: 2, 401: 2, 403: 2, 500: 1}},
  DELETE: {ratio: 1, statusRatio: {204: 195, 401: 2, 403: 2, 500: 1}        },
}});

const numOfLines    = 10;
const userGenerator = new UserGenerator({num: 100, typeRatio: {anonymous: 7, normal: 3}});
const reqGenerators = [reqGenerator, productsReqGenerator, commentsReqGenerator];
const dateGenerator = new DateGenerator();
const accessLog     = dummyAccessLog({numOfLines, userGenerator, reqGenerators, dateGenerator});

console.log(JSON.stringify(accessLog));
