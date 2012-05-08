
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , path   = require('path');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/public/views');
  app.set('view engine', 'html');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  console.log(__dirname);
  app.use(express.static(path.join(__dirname, '/public')));
  app.set("view options", {layout: false});

  app.register('.html', {
    compile: function(str, options){
      return function(locals){
        return str;
      };
    }
  });
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});
// connection to db and model creation

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/rentzso');

var Schema = mongoose.Schema;

// the mongoDB model of the 
var Tag = mongoose.model('Tag', new Schema({
  name: {type: String, index: true},
  links: [String]
}));


// Routes


// main page
app.get('/', routes.index);


// get request retrieves all the tags
app.get('/api/tags', function(req, res){
  //console.log(req);
  return Tag.find(function(err, tags) {
    return res.send(tags);
  });
});

app.get('/api/tags/:id', function(req, res){
  return Tag.findById(req.params.id, function(err, tag) {
    if (!err) {
      return res.send(tag);
    }
  });
});

app.put('/api/tags/:id', function(req, res){
  return Tag.findById(req.params.id, function(err, tag) {
    tag.name = req.body.name;
    tag.link = req.body.link;
    return tag.save(function(err) {
      if (!err) {
        console.log("updated");
      }
      return res.send(tag);
    });
  });
});


// post request handles passing data
// to the DB
app.post('/api/tags', function(req, res){
  //console.log(req);
  var tagList = [];
  //console.log(req.body);

  
  var index;
  // splitting the tags
  var in_tags = req.body.name.split(' ',20);

  //console.log(in_tags);


  // for each tag push the new link
  // in the link list relative to the tag
  for (index = 0;index < in_tags.length;index++) {
    (function(i){
      var cur_n = in_tags[i];
       
      Tag.update( { name : cur_n}, {$push: {links: req.body.link} },
		  { upsert: true}, function(err){
                                     console.log(err);
				     if (!err){
				       console.log('updated');
                                     }
                                   });
    })(index);
  } 

  return res.send('');
});


app.delete('/api/tags/:id', function(req, res){
  return Tag.findById(req.params.id, function(err, tag) {
    return tag.remove(function(err) {
      if (!err) {
        console.log("removed");
        return res.send('')
      }
    });
  });
});


app.listen(17507);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
