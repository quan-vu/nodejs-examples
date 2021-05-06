const app = require('express')();
const httpServer = require("http").Server(app);
const io = require('socket.io')(httpServer);

app.set('io', io);

app.get('/', function(req, res) {
   res.sendFile(__dirname + '/index.html');
});


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
// app.get('/notifications', (req, res) => {
//     data = {
//         'message': 'Received a GET HTTP method'
//     }
//     return res.send(data);
// });

app.post('/', (req, res) => {
    var message = "SocketIO emit on express route";
    var title = "Notification";
    var icon = "alert-icon";

    // console.log('Request data:', req.app.get('io') );
    
    // req.app.io.emit('new_notification', {
    //     message: message,
    //     title: title,
    //     icon: icon,
    // });

    try {
        req.app.get('io').emit('new_notification', {
            message: message,
            title: title,
            icon: icon,
        });
    } catch (error) {
        console.error('Error emit socket event from route!');
    }

    data = {
        'message': 'Received a POST HTTP method'
    }
    return res.send(data);
});

// app.put('/notifications', (req, res) => {
//     data = {
//         'message': 'Received a PUT HTTP method'
//     }
//     return res.send(data);
// });

// app.delete('/notifications', (req, res) => {
//     data = {
//         'message': 'Received a DELETE HTTP method'
//     }
//     return res.send(data);
// });

httpServer.listen(3001, function() {
   console.log('listening on localhost:3001');
});