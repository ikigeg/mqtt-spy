import { ArgumentParser } from 'argparse';

const parser = new ArgumentParser({ description: 'Record or replay MQTT messages' });
const clamp = (num: number, a: number, b: number) => Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b));

parser.add_argument('-b', '--broker', {
  metavar: 'mqtt-broker',
  type: 'str',
  default: 'mqtt://localhost:1883',
  help: 'the mqtt broker to spy on, default mqtt://localhost:1883',
});

parser.add_argument('-m', '--method', {
  type: 'str',
  default: 'record',
  help: 'record or replay messages',
  choices: ['record', 'replay']
});

parser.add_argument('-d', '--dilation', {
  metavar: 'dilation',
  type: 'int',
  default: 0,
  help: 'time dilation for replay of messages as a percentage, default 0',
});

parser.add_argument('-x', '--max-interval', {
  metavar: 'max',
  type: 'int',
  default: 0,
  help: 'max ms between events, default 0',
});

parser.add_argument('-a', '--activity', {
  type: 'str',
  default: `RECORDING-${new Date().toISOString()}`,
  help: 'name for the activity being recorded or replayed',
});

parser.add_argument('-c', '--channel', {
  type: 'str',
  default: '#',
  help: 'subscribe to a specific channel, or filter the replayed events, default #',
});

const parsedArgs = parser.parse_args();
console.log(parsedArgs);
export const args = {
  broker: parsedArgs.broker,
  method: parsedArgs.method,
  dilation: clamp(parsedArgs.dilation, 0, 100),
  activity: parsedArgs.activity,
  channel: parsedArgs.channel,
  maxInterval: parsedArgs.max_interval,
};

export const broker = args.broker;
export const method = args.method;
export const dilation = args.dilation;
export const activity = args.activity;
export const channel = args.channel;
export const maxInterval = args.maxInterval;

export default args;
