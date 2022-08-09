var express = require('express');
var multer  =   require('multer');
var router = express.Router();
var app = express();

/* GET home page. */
var storage =   multer.diskStorage({  
  destination: function (req, file, callback) {  
    callback(null, '../uploads');  
  },  
  filename: function (req, file, callback) {  
    callback(null, file.originalname);  
  }  
});  
var upload = multer({ storage : storage}).single('myfile');  
 
router.get('/', function(req, res, next) {
  res.render('index.ejs');
});

app.set('view engine', 'ejs');

app.get('/basement', function(req, res) {
  res.setHeader('Content-Type', 'text/plain');
  res.end('Sei nella cantina dei vini. Le bottiglie sono mie!');
});

app.get('/graph/:graphname', function(req, res) {
  res.render('graph.ejs', {graphname: req.params.graphname});
});

app.get('/build_graph', function(req, res) {
  res.render('build_graph.ejs');
});
app.get('/upload', function(req, res) {
  res.render('upload.ejs');
});
app.post('/uploadjavatpoint',function(req,res){  
  upload(req,res,function(err) {  
      if(err) {  
        return res.end("Error uploading file.");  
      }  
      res.end("File is uploaded successfully!");  
  });  
});  

app.use(function(req, res, next){
  res.setHeader('Content-Type', 'text/plain');
  res.status(404).send('La pagina non esiste amico!')
  //res.send(404, 'La pagina non esiste amico!');
});

app.listen(8080);



module.exports = router;
