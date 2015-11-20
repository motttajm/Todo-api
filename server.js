var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

//GET
app.get('/', function (req, res) {
	res.send('Todo API Root');
});

//GET /todos
app.get('/todos', function (req, res) {
	res.json(todos);
});

//GET /todos/:id
app.get('/todos/:id', function (req, res) {
	var todoID = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: todoID});

	if(matchedTodo){
		res.send(matchedTodo);
	} else {
		res.status(404).send();
	}
});

//POST /todos
app.post('/todos', function (req, res) {
	var body = _.pick(req.body, 'description', 'completed');
	if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0){
		return res.status(400).Send();
	}
	body.description = body.description.trim();
	body.id = todoNextId++;	
	todos.push(body);
	res.json(body);
});


//DELETE /todos/:id
app.delete('/todos/:id', function (req,res) {
	var deletionID = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: deletionID});

	if(matchedTodo){
		todos = _.without(todos,matchedTodo);
		res.json(matchedTodo);
	} else{
		res.status(404).send({"error": "No todo found with this id"});
	}
});




//start app
app.listen(process.env.PORT || 3000, function () {
	console.log('Express listening on port ' + PORT + '!');
});











