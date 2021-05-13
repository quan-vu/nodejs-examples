const PORT = process.env.PORT || 3099;
const CORS_HOSTS = [
  'http://localhost:3002',  // Web client run on nginx
  'http://localhost:3003',  // React client
  'http://localhost:3080',  // SocketIO Admin UI
  'http://socket-admin-ui:3080',  // SocketIO Admin UI
];
const crypto = require('crypto');
const express = require('express');
const { checkSchema, validationResult }  = require('express-validator');

const cors = require('cors')
const app = express();

const httpServer = require("http").Server(app);
// const { instrument } = require("@socket.io/admin-ui");
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

// instrument(io, {
//   auth: {
//     type: "basic",
//     username: process.env.SOCKET_ADMIN_USER,
//     password: process.env.SOCKET_ADMIN_PASSWORD_HASH,
//     /**
//      * the password is encrypted with bcrypt
//      * check scripts/generate_password.js
//     */
//   },
// });

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
const AuthClient = sequelize.define('auth_clients', {
  id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
  },
  clientId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  clientSecret: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  accessToken: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}
);

(async () => {
  await sequelize.sync().then(() => {
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

function currentUserMiddleware(req, res, next) {
  const token = req.header("x-authorization") !== undefined && req.header("x-authorization") ? req.header("x-authorization") : null;
  if (token){
    console.log(token);
    AuthClient.findOne({ where: { accessToken: token } }).then(user => {
      req.user = user;  // append the user object the the request object
      next(); // call next middleware in the stack
    });
  }else{
    next(); // call next middleware in the stack
  }
};

function isLoggedIn (req, res, next) {
  if (req.user) {
    next();
  } else {
    res.status = 401;
    return res.json({ message: "Unauthorized" });
  }
};

/**
 * Attach SocketIO to Expressjs
 */
app.set('io', io);
app.get('io').on('connection', onConnection);

/**
 * Configure Expressjs
 */
// Config CORS orign as global
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware
app.use(currentUserMiddleware);


/**
 * RestAPI
*/
app.get('/', function(req, res) {
  return res.json({ message: new Date()});
});

// Notification
app.post('/notifications', 
  isLoggedIn,
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
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

    const userConnection = await UserConnection.findOne({ where: { userId: userId } });
    
    if (userConnection) {
      // console.log("Found user with connection:", userConnection.socketId);
      try {
        // to individual socketid (private message)
        req.app.get('io').to(userConnection.socketId).emit('new_notification', data);
        return res.json({ 
          message: `Sent notifications to user: ${userId}.`
        });
      } catch (error) {
        return res.status(404).json({
          message: `Error when notifications to user: ${userId}`,
          error: error,
        });
      }
    }else{
      return res.json({
        message: `User ${userId} is offline.`
      });
    }
});

// Connection
app.get('/connections', isLoggedIn, function(req, res) {
  UserConnection.findAll().then(connections => res.json(connections));
});

// AuthClient
app.post('/auth/access_token', 
  checkSchema({
    client_id: {
      in: ['body'],
      errorMessage: 'Client ID is required!',
      isString: true,
      exists: {
        options: {
          checkNull: true,
        },
        errorMessage: 'Client ID is missing!',
      },
      customSanitizer: {
        options: (value, {}) => {
          return value !== undefined && value !== null ? value.trim() : '';
        },
      },
      isLength: {
        options: { min: 1 },
        errorMessage: 'Client ID should be at least 1 chars long!',
      },
    },
    client_secret: {
      in: ['body'],
      errorMessage: 'Client secret is required!',
      isString: true,
      exists: {
        options: {
          checkNull: true,
        },
        errorMessage: 'Client secret is missing!',
      },
      customSanitizer: {
        options: (value, {}) => {
          return value !== undefined && value !== null ? value.trim() : '';
        },
      },
      isLength: {
        options: { min: 1 },
        errorMessage: 'Client secret should be at least 1 chars long!',
      },
    },
  }),
  async (req, res) => {  
    const errors = validationResult(req);    
    if (!errors.isEmpty()) {
      return res.status(403).json({ errors: errors.array() });
    }

    const authClient = await AuthClient.findOne({ 
      where: { 
        clientId: req.body.client_id,
        clientSecret: req.body.client_secret,
      } 
    });

    if (authClient) {
        try {
          const accessToken = crypto.randomBytes(32).toString('hex');

          AuthClient.update({
            accessToken: accessToken,
          }, {
            where: { 
              clientId: authClient.clientId,
              clientSecret: authClient.clientSecret,
            } 
          });

          return res.json({
            message: `Create new access token successfully.`,
            data: {
              access_token: accessToken,
            }
          });
        } catch (error) {
          return res.status(500).json({
            message: `Error when create new access token!`,
          });
        }
    }else{
      return res.status(401).json({
        message: `Client is unauthorized`
      });
    }
  }
);

/**
 * Start server
 */
httpServer.listen(PORT, function() {
   console.log(`Listening on http://localhost:${PORT}`);
});