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
