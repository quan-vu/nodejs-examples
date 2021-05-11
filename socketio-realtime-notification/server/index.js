var express = require('express');
const bodyParser = require('body-parser');
const app = express();
const httpServer = require("http").Server(app);
const io = require('socket.io')(httpServer);

app.set('io', io);

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


httpServer.listen(3001, function() {
   console.log('listening on localhost:3001');
});