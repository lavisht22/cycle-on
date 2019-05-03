const redis = require('redis');
const bluebird = require('bluebird');

bluebird.promisifyAll(redis);

const client = redis.createClient(process.env.REDIS_URL);

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
