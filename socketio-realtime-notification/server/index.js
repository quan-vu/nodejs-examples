const PORT = process.env.PORT || 3099;
const CORS_HOSTS = [
  'http://localhost:3002',  // Web client run on nginx
  'http://localhost:3003',  // React client
  'http://localhost:3080',  // SocketIO Admin UI
  'http://socket-admin-ui:3080',  // SocketIO Admin UI
];

const express = require('express');
const { checkSchema }  = require('express-validator');
const { validationResult }  = require('express-validator/check');

const cors = require('cors')
const app = express();

const httpServer = require("http").Server(app);
const { instrument } = require("@socket.io/admin-ui");
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

instrument(io, {
  auth: {
    type: "basic",
    username: 'admin9',
    password: '$2b$10$otg69YkoOHHlvZVjBh5VT.7u4Q/d0haB7LuMVGlXCqs.4cx4J8h1u',
    /**
     * the password is encrypted with bcrypt
     * check scripts/generate_password.js
    */
  },
});

/** END - Init database */
const { Sequelize, Model, DataTypes } = require("sequelize");
// const sequelize = new Sequelize("sqlite::memory:");
const sequelize = new Sequelize({
    // The `host` parameter is required for other databases
    // host: 'localhost'
    dialect: 'sqlite',
    storage: './database.sqlite'
});
const UserConnection = sequelize.define('user_connections', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      isInt: true,
    },
    socketId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }
);

(async () => {
  await sequelize.sync({ force: true })
      .then(() => {
          console.log(`Database & tables created!`);
      });
})();
/** END - Init database */

var corsOptions = {
  origin: CORS_HOSTS,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

const onConnection = async (socket) => {
  // console.log("Request headers: ", socket.handshake.headers);
  console.log("New client connected");
  
  const headers = socket.handshake.headers;
  const userId = headers['x-authorization-id'] !== undefined && headers['x-authorization-id'] ? headers['x-authorization-id'] : null;
  const socketId = socket.id;

  // Save userId with connecttionId
  if(userId && socketId){    
    const data = {
      userId: userId,
      socketId: socketId
    };

    const condition = {
      userId: userId
    };

    const [record, created] = await UserConnection.upsert(
      data,               // Record to upsert
      condition,          // Condition to update
      { returning: true } // Return upserted record
    );
    // console.log("Upserted user connection: ", record);
  }

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    
    if(userId){
      try {
        UserConnection.destroy({
          where: {
            userId: userId
          }
        });
        console.log("Delete UserConnection record success.");
      } catch (error) {
        console.log("Error when delete UserConnection record!");
      }
    }
  });

  // Handle event: new_notification
  socket.on( 'new_notification', function( data ) {
    console.log(data.title,data.message);
    io.sockets.emit( 'show_notification', { 
      title: data.title, 
      message: data.message, 
      icon: data.icon, 
    });
  });

}

/**
 * Start ExpressJS server with Socket
**/

// Attach SocketIO to Expressjs
app.set('io', io);

// Config CORS orign as global
app.use(cors(corsOptions));

// Parser data from request
app.use(express.json());
// app.use(express.urlencoded({
//   extended: true
// }));

app.get('/', function(req, res) {
   res.sendFile(__dirname + '/index.html');
});

app.get('/connections', function(req, res) {
  UserConnection.findAll().then(connections => res.json(connections));
});

app.use('/static', express.static(__dirname + '/public'))

// Attach SocketIO to ExpressJS
app.get('io').on('connection', onConnection);

/**
 * RestAPI
*/
app.post('/notifications', 
  checkSchema({
    user_id: {
      in: ['body'],
      errorMessage: 'User ID is must be an integer!',
      isInt: true,
      toInt: true,
    },
    title: {
      in: ['body'],
      errorMessage: 'Title is required!',
      isString: true,
      exists: {
        options: {
          checkNull: true,
        },
        errorMessage: 'Title is missing!',
      },
      customSanitizer: {
        options: (value, {}) => {
          return value !== undefined && value !== null ? value.trim() : '';
        },
      },
      isLength: {
        options: { min: 1 },
        errorMessage: 'Title should be at least 1 chars long!',
      },
    },
    message: {
      in: ['body'],
      errorMessage: 'Message is required!',
      isString: true,
      exists: {
        options: {
          checkNull: true,
        },
        errorMessage: 'Message is missing!',
      },
      customSanitizer: {
        options: (value, {}) => {
          return value !== undefined && value !== null ? value.trim() : '';
        },
      },
      isLength: {
        options: { min: 1 },
        errorMessage: 'Message should be at least 1 chars long!',
      },
    },
    icon: {
      in: ['body'],
      errorMessage: 'Icon is required!',
      isString: true,
      exists: {
        options: {
          checkNull: true,
        },
        errorMessage: 'Icon is missing!',
      },
      customSanitizer: {
        options: (value, {}) => {
          return value !== undefined && value !== null ? value.trim() : '';
        },
      },
      isLength: {
        options: { min: 1 },
        errorMessage: 'Icon should be at least 1 chars long!',
      },
    },
  }),
  async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    console.log(req.body);
    const userId = req.body.user_id || 0;

    if (! userId) {
      return res.send({
        message: 'User ID is required!'
      });
    }

    const data = {
      title: req.body.title || "Notification",
      message: req.body.message || "SocketIO emit on express route",
      icon: req.body.icon || "/static/assets/images/user-avatar.png",
    }

    const userConnection = await UserConnection.findOne({ where: { userId, userId } });
    
    if (userConnection) {
      console.log("Found user with connection:", userConnection.socketId);
      try {
        // to individual socketid (private message)
        req.app.get('io').to(userConnection.socketId).emit('new_notification', data);
        return res.send({
          'message': `Sent notifications to user: ${userId}.`
        });
      } catch (error) {
        return res.status(404).send({
          'message': `Error when notifications to user: ${userId}`,
          'error': error,
        });
      }
    }else{
      return res.send({
        'message': `User ${userId} is offline.`
      });
    }
});

// Start ExpressJS server
httpServer.listen(PORT, function() {
   console.log(`Listening on http://localhost:${PORT}`);
});