import * as mosca from 'mosca';

let server:mosca.Server;
let dbIp = process.env.DB_IP || '127.0.0.1';

let pubsubsettings = {
    //using ascoltatore
    type: 'mongo',		
    url: 'mongodb://'+dbIp+':27017/mqtt',
    pubsubCollection: 'ascoltatori',
    mongo: {}
};

let moscaSettings = {
    port: 4001,			//mosca (mqtt) port
    backend: pubsubsettings	//pubsubsettings is the object we created above 
  
};

export function init() {
    server = new mosca.Server(moscaSettings);	//here we start mosca
    server.on('clientConnected', function(client) {
        console.log('client connected', client.id);
    });
    server.on('ready', setup);	//on init it fires up setup()
}

export function publishMesssage(topic: string, payload: any) {
    server.publish({topic: topic, payload: payload, qos:0, retain: false}, (obj: any, packet: mosca.Packet) => {
        //nothing to do
    });
}

//no one except the server is allowed to publish
var authorizePublish = function(client, topic, payload, callback) {
    callback(null, false);
}

// fired when the mqtt server is ready
function setup() {
    server.authorizePublish = authorizePublish;
    console.log('Mosca server is up and running')
}
