var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcryptjs');

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

	db.todo.findAll({
		where: where
	}).then(function(todos) {
		res.json(todos);
	}, function(e) {
		res.status(500).send();
	})
});

//GET /todos/:id
app.get('/todos/:id', function(req, res) {
	var todoID = parseInt(req.params.id, 10);

	db.todo.findById(todoID).then(function(todo) {
		if (!!todo) {
			res.json(todo.toJSON());
		} else {
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
		res.json(todo.toJSON());	//success
	}, function(e) {
		res.status(500).json(e);	//failure
	});
});

//DELETE /todos/:id
app.delete('/todos/:id', function(req, res) {
	var deletionID = parseInt(req.params.id, 10);
	db.todo.destroy({
		where: {
			id: deletionID
		}
	}).then(function(rowsDeleted) {
		if (rowsDeleted === 0) {
			res.status(404).json({
				error: 'No todo with id'
			});
		} else {
			res.status(204).send();
		}
	}, function() {
		res.status(500).send();
	})
});


// PUT /todos/:id
app.put('/todos/:id', function(req, res) {
	var updateID = parseInt(req.params.id, 10);
	var body = _.pick(req.body, 'description', 'completed');
	var attributes = {};

	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	}

	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	}

	db.todo.findById(updateID).then(function(todo) {
		if (todo) {
			//findByID successful
			todo.update(attributes).then(function(todo) {
				//follow-up for todo.update
				//update succeeded
				res.json(todo.toJSON());
			}, function(e) {
				//update failed
				res.status(400).json(e);
			});
		} else {
			//finById successful but id was not found
			res.status(404).send();
		}
	}, function() {
		//findByID fails
		res.status(500).send();
	});
});

//POST /users
app.post('/users', function (req, res) {
	var body = _.pick(req.body, 'email', 'password');	//filter data that was sent into request. Pick will select only the attributes you want

	db.user.create(body).then(function (user) {
		res.json(user.toPublicJSON());	//success
	}, function (e) {
		res.status(400).json(e);	//failure
	});
});

//POST /users/login
app.post('/users/login', function (req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.authenticate(body).then(function (user) {
		res.json(user.toPublicJSON());
	}, function () {
		res.status(401).send();
	});
});

//sync database
db.sequelize.sync({force: true}).then(function() { //add object {force: true} as parameter to drop and recreate all tables
	//start app
	app.listen(process.env.PORT || 3000, function() {
		console.log('Express listening on port ' + PORT + '!');
	});
});