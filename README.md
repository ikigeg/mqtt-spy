# mqtt-spy

This is a super simple library that can both record and replay messages sent over mqtt.

All incoming messages will be added to a queue, redacted, and then stored in a sqlite database.

Incoming messages can be recorded as a common activty then replayed. Replayed events can be done at the same time interval as they were recorded, or you can set a time dilation method to speed up or slow down.
