const express = require("express");
const path = require("path");
<<<<<<< HEAD
const dotenv = require("dotenv").config();
const assetRouter = require("./routes/assetManagement");
const https = require("https");
const fs = require("fs");
=======
const dotenv = require("dotenv");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const assetRouter = require("./routes/assetManagement");

dotenv.config();
>>>>>>> b015a9b4dc995345aa58c54c416016846df5e83d

const app = express();
const port = process.env.WEB_PORT || 8080;

app.set('view engine', 'ejs'); 
app.set('views', path.join(__dirname, 'views')); 
app.use(express.static(path.join(__dirname, "assets")));

app.use(express.static("public")); //static 미들웨어 설정

app.use(session({
  secret: "암호화키",
  resave: false,
  saveUninitialized: false,
}));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.get('/', (req, res) => {
  res.render('index.ejs');
});

app.use('/', require('./routes/account'));
app.use('/', require('./routes/post')); 
app.use('/', assetRouter);

app.listen(port, async () => {
  console.log(`${port} 서버가 준비되었습니다...`);
});
