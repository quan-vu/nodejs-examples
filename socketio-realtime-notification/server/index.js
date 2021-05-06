var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
   res.sendFile(__dirname + '/index.html');
});


io.on('connection', function (socket) {
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
app.get('/notifications', (req, res) => {
    data = {
        'message': 'Received a GET HTTP method'
    }
    return res.send(data);
});

app.post('/notifications', (req, res) => {
    data = {
        'message': 'Received a POST HTTP method'
    }
    return res.send(data);
});

app.put('/notifications', (req, res) => {
    data = {
        'message': 'Received a PUT HTTP method'
    }
    return res.send(data);
});

app.delete('/notifications', (req, res) => {
    data = {
        'message': 'Received a DELETE HTTP method'
    }
    return res.send(data);
});

http.listen(3001, function() {
   console.log('listening on localhost:3001');
});