var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;

app.get('/', function (req, res) {
	res.send('Todo API Root');
});

app.listen(3000, function () {
	console.log('Express listening on port ' + PORT + '!');
});