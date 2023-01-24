/* eslint-disable @typescript-eslint/no-explicit-any */
import * as MQTT from 'async-mqtt';
import { queue } from 'async';
import db from './db';
import { broker, method, dilation, activity, channel, maxInterval } from './cli';

const recordMessageWorker = db.addMessage;
const replayMessageWorker = (data: { topic: string; payload: string; wait: number }, callback: (err: string | void) => void) => {
  console.log('publish with wait', data.topic, data.payload, data.wait);
  client.publish(data.topic, data.payload).then(() => {
    setTimeout(() => callback(), data.wait);
  });
};

// Establish our queues with 1 worker at a time
const recordQueue = queue(recordMessageWorker, 1);
const replayQueue = queue(replayMessageWorker, 1);
const q = method === 'record' ? recordQueue : replayQueue;

const dilate = (wait: number, dilation: number) => Math.floor(wait - (wait * dilation / 100));

const populateReplayQueue = async (topic: string, done: () => void) => {
  q.drain(done);

  const activity = await db.getActivity(topic);
  for (let i = 0; i < activity.length; i += 1) {
    const current = activity[i];
    const next = i + 1 <= activity.length ? activity[i + 1] : undefined;

    let wait = next ? next.time - current.time : 0;
    if (wait > 0 && dilation > 0) {
      wait = dilate(wait, dilation);
    }
    if (wait && maxInterval && wait > maxInterval) {
      wait = maxInterval;
    }

    replayQueue.push({topic: current.topic, payload: current.payload, wait }, function (err) {
      if (err) {
        console.log(err);
        return;
      }
      console.log('New message for topic:', topic);
    });
  }
};


// eslint-disable-next-line 
q.error((err: any, task: any) => {
  console.error('task experienced an error', { err, task });
});

// Establish the MQTT client
const client = MQTT.connect(broker);

client.on('connect', async () => {
  try {
    await client.subscribe(channel);
    console.log(`Subscribed to ${channel}`);
  } catch (err) {
    console.log(`Could not subscribe to ${channel}`);
  }
});
client.on('disconnect', () => console.log('Disconnected from broker'));
client.on('error', (err: any) => console.log('ERROR in MQTT: ', err));

// Add new messages for processing in the queue to be added to the db
if (method === 'record') {
  client.on('message', (topic, payload) => {
    recordQueue.push({ activity, topic, payload: payload.toString(), time: new Date().getTime() }, function (err) {
      if (err) {
        console.log(err);
        return;
      }
      console.log('New message for topic:', topic);
    });
  });
}

const exitHandler = async () => {
  await db.disconnect();

  if (client.connected) {
    client.end();
  }

  console.log('Graceful exit, hooray!');
  process.exit();
};

['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) =>
  process.on(signal, exitHandler)
);


if (method === 'replay') {
  console.log('REPLAYING', activity);
  
  // Get all records from the db with the activity that matches the topic
  populateReplayQueue(activity, exitHandler);
}
  