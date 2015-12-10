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

		res.send({
			status:1
		});
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

app.listen(3000, function(){
	console.log('Lime & Rose is now running on port 3000');
});