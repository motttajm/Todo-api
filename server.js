var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;

var todos = [{
	id: 1, 
	description: 'Meet Mom for lunch',
	completed: false
}, {
	id: 2,
	description: 'Go to the market',
	completed: false
}, {
	id: 3,
	description: 'Make json website',
	completed: true
}];

app.get('/', function (req, res) {
	res.send('Todo API Root');
});

app.get('/todos', function (req, res) {
	res.json(todos);
});

app.get('/todos/:id', function (req, res) {
	var todoID = parseInt(req.params.id, 10);
	var matchedTodo;
	todos.forEach(function (todo) {
		if(todoID === todo.id){
			matchedTodo = todo;
		}
	})
	if(matchedTodo){
		res.send(matchedTodo);
	} else {
		res.status(404).send();
	}
});

app.listen(process.env.PORT || 3000, function () {
	console.log('Express listening on port ' + PORT + '!');
});