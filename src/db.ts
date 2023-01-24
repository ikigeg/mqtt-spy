import * as sqlite3 from 'sqlite3';
import redact from './redact';

type STORED_MQTT_MESSAGE = { activity: string, topic: string, payload: string, time: number };
type MQTT_MESSAGE = { topic: string, payload: string, time: number };

const db = () => {
  let database: sqlite3.Database | undefined;
  let index = 0;

  database = new sqlite3.Database('./mqtt.db', (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the mqtt db!');
  });

  // make sure we have the required table
  database.run('CREATE TABLE IF NOT EXISTS messages(activity text, topic text, payload text, time int, idx int)');

  const disconnect = async () => {
    if (database) {
      await database.close((err) => {
        if (err) {
          console.error(err.message);
        }
        console.log('Close the database connection.');
        database = undefined;
      });
    }
  };
  
  const addMessage = (data: STORED_MQTT_MESSAGE | STORED_MQTT_MESSAGE[], callback: (err: string | void) => void) => {
    if (!database) {
      throw ('Database is not connected');
    }

    const dataArray = Array.isArray(data) ? data : [data];
    const redacted = dataArray.map(d => ({ ...d, payload: redact(d.payload), index }));

    let error: string | undefined;
    redacted.forEach(record => 
      database && database.run(
        'INSERT INTO messages(activity, topic, payload, time, idx) VALUES (?,?,?,?,?)',
        [record.activity, record.topic, record.payload, record.time, index],
        function (err) {
          if (err) {
            error = err.message;
            // return callback(err.message);
            return;
          }
          // console.log(`A row has been inserted with rowid ${this.lastID}`);
          index++;
        })
    );
    
    callback(error);
  };

  const getActivity = (activity: string): Promise<MQTT_MESSAGE[]> => 
    new Promise((resolve, reject) => {
      if (!database) {
        return reject('Database is not connected');
      }
      database.all(
        'SELECT topic, payload, time FROM messages WHERE activity = ? ORDER BY time, idx',
        [activity],
        function (err, rows) {
          if (err) {
            return reject(err.message);
          }
          resolve(rows);
        });
    });

  return {
    database,
    disconnect,
    addMessage,
    getActivity,
  };
};

export default db();
