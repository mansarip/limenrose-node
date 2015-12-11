var express      = require('express');
var app          = express();
var bodyParser   = require('body-parser');
var session      = require('express-session');
var fs           = require('fs');
var configFile   = 'config.db';
var configExists = fs.existsSync(__dirname + '/' + configFile);
var sqlite       = require("sqlite3").verbose();
var db           = new sqlite.Database(__dirname + '/' + configFile);
var md5          = require('md5');
var apidata      = require(__dirname + '/api.json');
var mysql        = require('mysql');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(session({
	secret: 'limenrose',
	resave: false,
	saveUninitialized: false
}));

// default landing
app.get('/', function(req, res){
	if (req.session.logged) {
		res.sendFile(__dirname + '/admin.html');	
	} else {
		res.sendFile(__dirname + '/login.html');
	}
});

// designer
app.get('/designer', function(req, res){
	if (req.session.logged) {
		res.sendFile(__dirname + '/designer.html');
	} else {
		res.sendFile(__dirname + '/login.html');
	}
});

// designer : test connection
app.post('/api/designer/testconnection', function(req, res){
	var con = mysql.createConnection({
		host: req.body.host,
		user: req.body.user,
		password: req.body.pass
	});

	con.connect(function(err){
		if (err) {
			res.send({
				status:0,
				message: err.code + ' ('+ err.errno +')'
			});

			return;
		}

		res.send({status:1});
	});

	con.end();
});

// designer : preview records
app.post('/api/designer/previewrecords', function(req, res){
	var resData = {};
	resData.status = 0;

	req.body.connection = JSON.parse(req.body.connection);
	req.body.param = JSON.parse(req.body.param);

	var con = mysql.createConnection({
		host: req.body.connection.host,
		user: req.body.connection.user,
		password: req.body.connection.password
	});

	var prepare = PrepareSQLQuery({
		query: req.body.query,
		param: req.body.param
	});

	con.query(prepare.query, prepare.param, function(err, result){
		if (err) {
			resData.err = err;
			res.send(resData);
			return;
		}

		resData.status = 1;
		resData.result = result;
		res.send(resData);
	});

	con.end();
});

// login
app.post('/api/login', function(req, res){
	db.get('SELECT * FROM user WHERE username = ? and password = ?', [req.body.username, md5(req.body.password)], function(err, row){
		if (row === undefined) {
			res.send({
				status:'failed'
			});
		} else {
			req.session.logged = true;
			res.send({
				status:'success'
			});
		}
	});
});

// get data for admin panel
app.get('/api/admin/data', function(req, res){
	if (req.session.logged) {

		var summary;
		var user;

		db.serialize(function(){
			
			db.get('SELECT * FROM summary', [], function(err, row){
				summary = row;

				db.all('SELECT username, type FROM user', [], function(err, row){
					user = row;
					res.send({
						status:'success',
						data : {
							summary : summary,
							user : user,
							api : apidata
						}
					});
				});

			});

		});
		
	} else {
		res.send({
			status:'failed',
			message:'Access denied.'
		});
	}
});

// logout
app.get('/api/logout', function(req, res){
	req.session.destroy();
	res.end();
});

// check login
app.get('/api/checklogin', function(req, res){
	if (req.session.logged) {
		res.send({
			status : 1
		});	
	} else {
		res.send({
			status : 0
		});	
	}
});

// get session id
app.get('/api/getsessionid', function(req, res){
	res.send('');
});

function PrepareSQLQuery(data) {
	var originalQuery = data.query;
	var modifiedQuery = data.query.slice(0);
	var paramValue = [];
	var paramWithIndex = {};

	if (data.param === undefined) {
		data.param = {};
	}

	if (Object.keys(data.param).length > 0) {
		for (var key in data.param) {
			var search = '{{'+  key +'}}';
			var regex = new RegExp(search, 'g');
			var match;
			var tempFakeString = '';

			for (var f = 0; f < search.length; f++) {
				tempFakeString += '-';
			}

			while (match = regex.exec(modifiedQuery) != null) {
				var i = modifiedQuery.indexOf(search);
				modifiedQuery = modifiedQuery.replace(search, tempFakeString);

				paramWithIndex[i] = search.substr(2).slice(0,-2);
			}
		}

		for (var key in paramWithIndex) {
			paramValue.push(data.param[paramWithIndex[key]]);
		}

		for (var key in data.param) {
			var search = '{{'+ key +'}}';
			var regex = new RegExp(search, 'g');
			originalQuery = originalQuery.replace(regex, '?');
		}	
	}

	return {
		query : originalQuery,
		param : paramValue
	};
}

app.listen(3000, function(){
	console.log('Lime & Rose is now running on port 3000');
});