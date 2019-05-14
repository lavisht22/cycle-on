const WebSocket = require('ws');

const { CYCLE_STATUS, LOCK_STATUS } = require('../helpers/constants');
const redisHelper = require('../helpers/redis');

const createWebSocketServer = server => {
  // initialize the WebSocket server instance
  const wss = new WebSocket.Server({ server });

  wss.on('connection', ws => {
    ws.on('message', async message => {
      const data = message.split(' ');

      if (data.length < 6) {
        ws.send('Error while processing this command. Check number of arguments.');
      }
      const commandType = data[0];
      const cycleId = data[1];
      const lat = data[2];
      const long = data[4];
      const lockStatus = data[5];

      if (commandType === 'reg') {
        try {
          await redisHelper.setKey(`${cycleId}_status`, CYCLE_STATUS.AVAILABLE);
          await redisHelper.setKey(`${cycleId}_lock`, LOCK_STATUS.LOCKED);
          await redisHelper.setKey(`${cycleId}_long`, long);
          await redisHelper.setKey(`${cycleId}_lat`, lat);
          ws.send('Data Saved!');
        } catch (error) {
          ws.send('Error! Unable to process settings on server.');
        }
      }

      if (commandType === 'update') {
        try {
          await redisHelper.setKey(`${cycleId}_long`, long);
          await redisHelper.setKey(`${cycleId}_lat`, lat);
          const cycleStatus = await redisHelper.getKey(`${cycleId}_status`);
          const cycleLockStatus = await redisHelper.getKey(`${cycleId}_lock`);

          if (cycleStatus === CYCLE_STATUS.AVAILABLE && cycleLockStatus === LOCK_STATUS.LOCKED) {
            ws.send('111');
          } else if (
            cycleStatus === CYCLE_STATUS.AVAILABLE &&
            cycleLockStatus === LOCK_STATUS.UNLOCKED
          ) {
            ws.send('110');
          } else if (
            cycleStatus === CYCLE_STATUS.BOOKED &&
            cycleLockStatus === LOCK_STATUS.LOCKED
          ) {
            ws.send('101');
          } else if (
            cycleStatus === CYCLE_STATUS.BOOKED &&
            cycleLockStatus === LOCK_STATUS.UNLOCKED
          ) {
            ws.send('100');
          } else {
            ws.send('000');
          }
        } catch (error) {
          ws.send('Error! Unable to process settings on server.');
        }
      }
    });
  });
};

module.exports = {
  createWebSocketServer
};
