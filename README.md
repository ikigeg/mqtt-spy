# mqtt-spy

This is a super simple library that can both record and replay messages sent over mqtt.

All incoming messages will be added to a queue, redacted, and then stored in a sqlite database.

Incoming messages can be recorded as a common activty then replayed. Replayed events can be done at the same time interval as they were recorded, or you can set a time dilation method to speed up or slow down.

Example command to replay an activity:
```
npm start -- -m replay -a NEW_SPECTATOR -x 1000
```

Example to record traffic on a specific broker:
```
npm start -- -m record -a Snoopy-snoop-2023 -b mqtt://192.168.1.122:1883
```

Example to echo out recorded traffic with a compressed interval of 1000ms between messages:
```
npm start -- -m echo -a Snoopy-snoop-2023 -x 1000
```

## CLI help text

```
npm start -- -h

> mqtt-spy@1.0.0 start
> ts-node src/index.ts -h

usage: index.ts [-h] [-b mqtt-broker] [-m {record,replay}] [-d dilation] [-x max] [-a ACTIVITY] [-c CHANNEL]

Record or replay MQTT messages

optional arguments:
  -h, --help            show this help message and exit
  -b mqtt-broker, --broker mqtt-broker
                        the mqtt broker to spy on, default mqtt://localhost:1883
  -m {record,replay}, --method {record,replay}
                        record or replay messages
  -d dilation, --dilation dilation
                        time dilation for replay of messages as a percentage, default 0
  -x max, --max-interval max
                        max ms between events, default 0
  -a ACTIVITY, --activity ACTIVITY
                        name for the activity being recorded or replayed
  -c CHANNEL, --channel CHANNEL
                        subscribe to a specific channel, or filter the replayed events, default #
```
