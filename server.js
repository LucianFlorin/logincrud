const Helper = require('./helpers/Helper');
const main = require('./controllers/main');

const express = require('express');
const session = require('express-session');
const redis = require('redis');
const redisClient = redis.createClient();
const redisStore = require('connect-redis')(session);

// use process.env variables to keep private variables,
// be sure to ignore the .env file in github
require('dotenv').config();

// Express Middleware
const helmet = require('helmet'); // creates headers that protect from attacks (security)
const bodyParser = require('body-parser'); // turns response into usable format
const cors = require('cors');  // allows/disallows cross-site communication
const morgan = require('morgan'); // logs requests

// db Connection w/ localhost
const db = require('knex')({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : 'postgres',
    database : 'crud'
  }
});

// App
const app = express();

redisClient.on('error', (err) => {
  console.log('Redis error: ', err);
});

// Start a session; we use Redis for the session store.
// "secret" will be used to create the session ID hash (the cookie id and the redis key value)
// "name" will show up as your cookie name in the browser
// "cookie" is provided by default; you can add it to add additional personalized options
// The "store" ttl is the expiration time for each Redis session ID, in seconds
app.use(session({
  secret: 'RedisSessionSecret',
  name: '_redisPractice',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, expires: 1000 * 60 * 5 },
  store: new redisStore({ host: 'localhost', port: 6379, client: redisClient, ttl: 86400 }),
}));

const whitelist = ['http://localhost:3001'];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
};
app.use(helmet());
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(morgan('combined')); // use 'tiny' or 'combined'

app.post("/login", (req, res, next) => {
  if (req.body.username && req.body.password) {
      main.logInUser(req, res, db);
  }
  else {
    res.send('Incorrect username or password!');
  }
});

// App Routes - Auth
app.get('/crud', (req, res) => main.getProjects(req, res, db));
app.post('/crud', (req, res) => main.postProject(req, res, db));
app.put('/crud', (req, res) => main.putProject(req, res, db));
app.delete('/crud', (req, res) => main.deleteProject(req, res, db));
app.post('/register', (req, res) => main.registerUser(req, res, db));

// App Server Connection
app.listen(process.env.PORT || 3000, () => {
  console.log(`app is running on port ${process.env.PORT || 3000}`)
});