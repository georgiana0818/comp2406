/*Student Name: Meitong Liu
   Student ID:  101014282
   cited:       COMP2406 course note 
                http://stackoverflow.com/questions/6528876/how-to-redirect-404-errors-to-a-page-in-expressjs
                */

var express = require('express');
var app = express();
var mongo= require('mongodb').MongoClient;
var bodyParser = require('body-parser');

app.set('views','./views');
app.set('view engine','pug');


var db;

//connect to the db
mongo.connect("mongodb://localhost:27017/recipeDB",function(err,database){
	if(err)throw err;
	app.listen(2406,function(){console.log("Server listening on port 2406");});
	db = database; //store the connection (pool)
});


app.use(function(req,res,next){
	console.log(req.method+" request for "+req.url);
	next();
});

app.get(["/","/index" ,"/index.html"],function(req,res){
    res.render('index')
});

app.use("/recipes",bodyParser.json());
app.use("/recipes",bodyParser.urlencoded({extended:true}));
app.get("/recipes",function(req,res){
    var recipeNames = [];
    var cursor = db.collection("recipes").find();
    cursor.toArray(function(err,document){
        //console.log(document);
        for(var i = 0;i<document.length;i++){
            recipeNames.push(document[i].name);
        }
            //console.log(recipeNames);
            res.send({name:recipeNames});
});
});

app.use("/recipe",bodyParser.json());
app.use("/recipe",bodyParser.urlencoded({extended:true}));
app.get("/recipe/:id",function(req,res){
   // console.log(req.params.id); 
     db.collection("recipes").findOne({name:req.params.id},function(err,document){
         if(document == null){
             res.status(404).render('404');
         }
         else{
            
             var recp = {name:document.name, duration:document.duration,
                         ingredients:document.ingredients, directions:document.directions,
                         notes:document.notes};
             //console.log(recp);
             res.send(recp);
         }
     });
});

app.post("/recipe", function(req,res){
	console.log(req.body);
	//upsert to db
	db.collection("recipes").update({name:req.body.name},req.body,{upsert:true},function(err,result){
		if(err)
			res.sendStatus(500);
		else
			res.sendStatus(200);
	});
});

app.use(express.static("./public"));


