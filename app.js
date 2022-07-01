var express = require('express');
var path = require('path');
var app = express();
var session = require('express-session');
//var routes = require("./routes/acceuil");
var ejs = require('ejs');
var redis = require('redis');

// host:port 0.0.0.0:8080
//Hôte 0.0.0.Mappez le port 0 sur le port 8080.
const PORT = 8080;
const HOST = '0.0.0.0';

//View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


//Basé sur un fichier public → Cela vous permet de lire les css et javascript en public
app.use(express.static(path.join(__dirname, 'public')));

// Get page home
app.get('/home.html', (req, res) => {
  res.sendFile(__dirname + "/views/home.html")
});
// Get page d'acceuil
var g = app.get('/', (req, res) => {
  res.render("index.ejs")
});

const client = redis.createClient(process.env.REDIS_URL);

const redisStore = require('connect-redis')(session);
  

client.on('error', function (err) {
  console.log('Could not establish a connection with redis. ' + err);
});
client.on('connect', function (err) {
  console.log('Connected to redis successfully');
});

const  sessionStore = new redisStore({ client: client });

app.post('/auth' , (req, res, next)=>{
  try{ 
  let username = req.body.username;
  let password = req.body.password;
  client.hgetall(username, function(err, obj){
    
  if(!obj){
      return res.send({
          message: "Invalid username or password"
      })
  }
  console.log(obj);
  const isValidPassword = compareSync(password, obj.password);
  if(isValidPassword){
      console.log(req.session);
      obj.password = undefined;
      console.log(obj);
      req.session.username = obj.username;
      console.log(req.session.username);
       return res.redirect(g);
  }  else{
       res.send(
           "Invalid email or password"
      );
      return res.redirect('/home.html')
  }
});
       
  } catch(e){
      console.log(e);
  }


});


// Get page graphe1
app.get('/graphe1.html', (req, res) => {
  res.sendFile(__dirname + "/views/graphe1.html")
});
app.get('/graphe1.js', (req, res) => {
  res.sendFile(__dirname + "/views/graphe1.js")
});
app.get('/function.js', (req, res) => {
  res.sendFile(__dirname + "/views/function.js")
});
app.get('/d3.min.js', (req, res) => {
  res.sendFile(__dirname + "/views/d3.min.js")
});
app.get('/jquery.js', (req, res) => {
  res.sendFile(__dirname + "/views/jquery.js")
});
app.get('/jquery.nice-select.js', (req, res) => {
  res.sendFile(__dirname + "/views/jquery.nice-select.js")
});
app.get('/style.css', (req, res) => {
  res.sendFile(__dirname + "/views/style.css")
});

// Get page graphe2
app.get('/graphe2.html', (req, res) => {
  res.sendFile(__dirname + "/views/graphe2.html")
});
app.get('/graphe2.js', (req, res) => {
  res.sendFile(__dirname + "/views/graphe2.js")
});

// Get page graphe3
app.get('/graphe3.html', (req, res) => {
  res.sendFile(__dirname + "/views/graphe3.html")
});
app.get('/graphe3.js', (req, res) => {
  res.sendFile(__dirname + "/views/graphe3.js")
});

// Get page graphe4
app.get('/graphe4.html', (req, res) => {
  res.sendFile(__dirname + "/views/graphe4.html")
});
app.get('/graphe4.js', (req, res) => {
  res.sendFile(__dirname + "/views/graphe4.js")
});

const redisClient1 = require('./redis-client');
app.get('/store/:key', async (req, res) => {
    const { key } = req.params;
    const value = req.query;
    await redisClient.setAsync(key, JSON.stringify(value));
    return res.send('Success');
});
app.get('/:key', async (req, res) => {
    const { key } = req.params;
    const rawData = await redisClient.getAsync(key);
    return res.json(JSON.parse(rawData));
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);