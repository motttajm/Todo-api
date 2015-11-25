var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');


var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

//GET
app.get('/', function(req, res) {
	res.send('Todo API Root');
});

//GET /todos?completed=true&q=house
app.get('/todos', function(req, res) {
	var query = req.query;
	var where = {};


	//filter for completed
	if (query.hasOwnProperty('completed') && query.completed === 'true') {
		where.completed = true;
	} else if (query.hasOwnProperty('completed') && query.completed === 'false') {
		where.completed = false;
	}

	//filter using query
	if (query.hasOwnProperty('q') && query.q.trim().length > 0) {
		where.description = {
			$like: '%' + query.q + '%'
		};
	}

	db.todo.findAll({where: where}).then(function (todos) {
		res.json(todos);
	}, function (e) {
		res.status(500).send();
	})
});

//GET /todos/:id
app.get('/todos/:id', function(req, res) {
	var todoID = parseInt(req.params.id, 10);

	db.todo.findById(todoID).then(function(todo) {
		if (!!todo) {
			res.json(todo.toJSON());
		}else {
			res.status(404).send();
		}
	}, function(e) {
		res.status(500).send();
	})
});

//POST /todos
app.post('/todos', function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');

	db.todo.create(body).then(function(todo) {
		res.json(todo.toJSON());
	}, function(e) {
		res.status(500).json(e);
	});
});

//DELETE /todos/:id
app.delete('/todos/:id', function(req, res) {
	var deletionID = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {
		id: deletionID
	});

	if (matchedTodo) {
		todos = _.without(todos, matchedTodo);
		res.json(matchedTodo);
	} else {
		res.status(404).send({
			"error": "ID not found"
		});
	}
});


// PUT /todos/:id
app.put('/todos/:id', function(req, res) {
	var updateID = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {
		id: updateID
	});
	var body = _.pick(req.body, 'description', 'completed');
	var validAttributes = {};

	if (!matchedTodo) {
		res.status(404).send({
			"error": "ID not found"
		});
	}

	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		validAttributes.completed = body.completed;
	} else if (body.hasOwnProperty('completed')) {
		return res.status(400).send({
			"error": "completed data bad"
		});
	}

	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
		validAttributes.description = body.description;
	} else if (body.hasOwnProperty('description')) {
		return res.status(400).send({
			"error": "description data bad"
		});
	}

	_.extend(matchedTodo, validAttributes);
	res.json(matchedTodo);
});

//sync database
db.sequelize.sync().then(function() {
	//start app
	app.listen(process.env.PORT || 3000, function() {
		console.log('Express listening on port ' + PORT + '!');
	});
});