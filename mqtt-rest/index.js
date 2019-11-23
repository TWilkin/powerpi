import bodyParser from 'body-parser';
import express from 'express';
import mqtt from 'mqtt';

// connect to the MQTT queue
const client = mqtt.connect('mqtt://192.168.2.10');

// initialise Express
let app = express();
app.use(bodyParser.json())

// define the POST end point that will publish the messages to the topic
app.post('/topic/:topicName', (req, res) => {
    console.log(`Sending to topic ${req.params.topicName} ${JSON.stringify(req.body)}`);
    client.publish(req.params.topicName, JSON.stringify(req.body));
    res.sendStatus(200);
});

// start the application running
app.listen(3000, () => {
    console.log('Server running');
});
