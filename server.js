var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var request = require('request');
var cheerio = require('cheerio');


app.use(logger('dev'));
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(express.static('public'));

 

//Database configuration
mongoose.connect('mongodb://localhost/mongoosescraper');
var db = mongoose.connection;

db.on('error', function (err) {
console.log('Mongoose Error: ', err);
});
db.once('open', function () {
console.log('Mongoose connection successful.');
});

//Require Schemas
var Note = require('./models/Note.js');
var Article = require('./models/Article.js');


// Routes
app.get('/', function(req, res) {
  res.send(index.html);
});


app.get('/scrape', function(req, res) {
	
  request('http://www.nytimes.com/section/us/', function(error, response, html) {
  	if (error){console.log("There was an error:"+error)};

    var $ = cheerio.load(html);
    $('article.story.theme-summary').each(function(i, element) {
    	
    	if ($(this).children('footer').length == 1){
    		var here1 = $(this).children('div').children('a')
    		var here1in = here1.children('div.story-meta') 
    		var here1link = here1.attr('href');
    		var here1title = here1in.children('h2').text().trim();
    		var here1sum = here1in.children('p').text();
    		// console.log(here1title)
    		// console.log(here1link)
    		// console.log(here1sum)
    		putin(here1title, here1link, here1sum);

    	}else{

    		var here = $(this).children('div');
    		var herein = here.children('h2').children('a')
    		var heretitle = herein.text();
    		var herelink = herein.attr('href');
    		var heresum = here.children('p.summary').text();
    		// console.log(heretitle)
    		// console.log(herelink)
    		// console.log(heresum)
    		putin(heretitle, herelink, heresum);
    	}

    	function putin(title, link, sum) {
    		var result = {};

				result.title = title;
				result.link = link;
				result.summary = sum;

				var entry = new Article (result);

				entry.save(function(err, doc) {
				  if (err) {
				    console.log(err);
				  } 
				});

    	}

    });
  });
  console.log("Scrape Complete");
  res.send(true)
  res.redirect('/');
});


app.get('/articles', function(req, res){

	Article.find().then(function(data){
		console.log(data);
		res.send(data)
	})
});


app.get('/articles/:id', function(req, res){
	//Finish the route so it finds one article from the req.params.id,

	//populates "note",

	//and then responds with the article
	var aid = req.params.id;
	console.log("The id is" + aid);
	 Article.findById(aid).populate('note').exec(function(err, result){
	 		if (err){console.log(err)};
	 	
	 	res.send(result);
	 	

	 })

});

app.post("/notes/:id", function(req,res){

	var update = {};
	update.title = req.body.title;
	update.body = req.body.body;
	update.name= req.body.name;
	var query = req.params.id;

	Note.findOneAndUpdate({"_id":query}, update, {new:true}, function(err,note){
		if (err){console.log(err)};
		res.send(note)
	})

})

app.post("/delete/:id", function(req,res){

	var id = req.params.id;
	Note.findByIdAndRemove({_id: id},function(err, result){
		if (err) {console.log(err)}
		res.send(result);
	})
	
})


app.post('/articles/:id', function(req, res){
	//save a new note

	
	var result = {};
	result.title = req.body.title;
	result.body = req.body.body;
	result.name= req.body.name;
	var query = req.params.id;
	
	var entry = new Note(result);
	entry.save(function(err, note){
		if (err){console.log(err);};
		console.log("GOT INTO SAVE")
		res.send(note);
	}).then(function(noteid){
		console.log("got into the then");
		Article.findOneAndUpdate({"_id":req.params.id}, {$addToSet:{note:noteid._id}}, {new:true}, function(err, news){
			if(err){
				console.log(err)
			};
			console.log("GOT INTO THE FINDANDMOD")
			console.log(news);
			
		})
	})
	

});








app.listen(3000, function() {
  console.log('App running on port 3000!');
});
