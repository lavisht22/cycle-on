const redis = require('redis');
const bluebird = require('bluebird');

const CONFIG = require('./config');

bluebird.promisifyAll(redis);

const client = redis.createClient(CONFIG.REDIS_URL);

const setKey = (key, value) => {
  return client.setAsync(key, value);
};

const getKey = key => {
  return client.getAsync(key);
};

module.exports = {
  setKey,
  getKey
};
