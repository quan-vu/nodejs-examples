const PORT = process.env.PORT || 3099;
const CORS_HOSTS = [
  'http://localhost:3002',  // Web client run on nginx
  'http://localhost:3003',  // React client
];

var express = require('express');
var cors = require('cors')
const app = express();
const httpServer = require("http").Server(app);
const io = require('socket.io')(httpServer, {
  cors: {
    origin: CORS_HOSTS,
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: [
      'content-type', 
      'authorization', 
      'x-authorization-id'
    ]
  }
});

// START - Database
const fs = require('fs');
const FAKE_DB = './data/user_connections.json';

const readDB = () => {
  let rawdata = fs.readFileSync(FAKE_DB);
  let user_connections = JSON.parse(rawdata);
  console.log(user_connections);    
  return user_connections;
}


const addUserConnection = (userId, connectionId) => {

  // let currentData = readDB();

  // if(! currentData) {
  //     currentData = { 
  //         userId: connectionId,
  //     };
  // }else {
  //   currentData = {};
  //   currentData[userId] = connectionId;
  // }

  let currentData = {};
  currentData[userId] = connectionId;
  console.info(currentData);
   
  data = JSON.stringify(currentData, null, 2);
  fs.writeFileSync(FAKE_DB, data);
}
// END - Database

var corsOptions = {
  origin: CORS_HOSTS,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

let interval;

const getApiAndEmit = socket => {
  const response = new Date();
  // Emitting a new message. Will be consumed by the client
  socket.emit("FromAPI", response);
};

const onConnection = (socket) => {

  // Auto disconnect to avoid flooding the server.
  console.log("New client connected");
  // console.log("Request headers: ", socket.handshake.headers); // an object containing "my-custom-header": "1234"

  // Save connecttion id
  const headers = socket.handshake.headers;
  if(headers['x-authorization-id'] !== undefined && headers['x-authorization-id']){
    // console.log(socket.id);
    const connectionId = socket.id;
    const userId = headers['x-authorization-id'];    
    addUserConnection(userId, connectionId);
  }

  if (interval) {
    clearInterval(interval);
  }
  interval = setInterval(() => getApiAndEmit(socket), 1000);
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    clearInterval(interval);
  });

  // Handle events
  socket.on( 'new_notification', function( data ) {
    console.log(data.title,data.message);
    io.sockets.emit( 'show_notification', { 
      title: data.title, 
      message: data.message, 
      icon: data.icon, 
    });
  });

  // registerUserHandlers(io, socket);
}

// Attach SocketIO to Expressjs
app.set('io', io);

// Config CORS orign as global
app.use(cors(corsOptions));

// Parser data from request
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.get('/', function(req, res) {
   res.sendFile(__dirname + '/index.html');
});

app.use('/static', express.static(__dirname + '/public'))

app.get('io').on('connection', onConnection);

/**
 * RestAPI
*/
app.post('/notifications', (req, res) => {
    console.log(req.body);

    data = {
      title: req.body.title || "Notification",
      message: req.body.message || "SocketIO emit on express route",
      icon: req.body.icon || "/static/assets/images/user-avatar.png",
    }

    try {
        req.app.get('io').emit('new_notification', data);
    } catch (error) {
        console.error('Error emit socket event from route!', error);
    }

    data = {
        'message': 'Sent a realtime notification on Express route'
    }
    return res.send(data);
});


httpServer.listen(PORT, function() {
   console.log(`Listening on http://localhost:${PORT}`);
});