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

app.use(session({
  secret: 'RedisSessionSecret',
  name: '_redisPractice',
  cookie: { secure: false},
  store: new redisStore({ host: 'localhost', port: 6379, client: redisClient, ttl: 300 }),
}));

app.use(helmet());
app.use(cors({credentials : true, origin: "http://localhost:3007"}));
app.use(bodyParser.json());
app.use(morgan('combined'));

app.post("/login", (req, res, next) => {
  if (req.body.username && req.body.password) {
    main.logInUser(req, res, db);
  }
  else {
    res.status(500).send('Incorrect username or password!');
  }
});
app.get("/crud", (req, res) => main.getProjects(req, res, db));
app.post('/crud', (req, res) => main.postProject(req, res, db));
app.put('/crud', (req, res) => main.putProject(req, res, db));
app.delete('/crud', (req, res) => main.deleteProject(req, res, db));
app.post('/register', (req, res) => main.registerUser(req, res, db));

// App Server Connection
app.listen(process.env.PORT || 3000, () => {
  console.log(`app is running on port ${process.env.PORT || 3000}`)
});