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
    methods: ["GET", "POST"]
  }
});

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

app.get('io').on('connection', function (socket) {

  // Auto disconnect to avoid flooding the server.
  console.log("New client connected");
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
});

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