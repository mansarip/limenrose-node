/**
 * Ini adalah untuk simulate post dan get request
 * dan lihat apa result yang LNR hantar
 */

var request = require('request');
var mysql = require('mysql');

/*var con = mysql.createConnection({
	host:'localhost',
	user:'root',
	password:''
});

con.query('select * from test.peribadi where negeri = ?', [true], function(err, result){
	console.log(result);
});

con.end();*/

TestFetchColumnWithVariable();

function TestFetchColumnWithVariable() {
	var url = 'http://localhost:3000/api/designer/fetchcolumn';

	var data = {
		connection: {
			name: 'AAA',
			type: 'mysql',
			host: 'localhost',
			user: 'root',
			password: '',
			dbname: 'test',
			port: '3306',
			sid: 'Hoho',
			serviceName: 'Wuuuu',
			socket: '9090',
			undefined: 'Reset'
		},
		query: 'select * from test.peribadi where negeri = {{negeri}}',
		param: { negeri: 'SELANGOR' }
	};

	request.post({
		url:url,
		form:data
	}, function(err, res, body){
		console.log(body);
	});;
}

function TestPreviewRecordsQuery() {
	var url = 'http://localhost:3000/api/designer/previewrecords';

	var data = {
		dhxr1449815096081: '1',
		connection: '{"name":"AAA","type":"mysql","host":"localhost","user":"root","password":"","dbname":"test","port":"3306","sid":"Hoho","serviceName":"Wuuuu","socket":"9090","undefined":"Reset"}',
		query: 'select * from test.peribadi where anegeri = {{negeri}}',
		max: '100',
		param: '{"negeri":"SELANGOR"}'
	};

	request.post({
		url : url,
		form : data
	}, function(err, res, body){
		console.log(body);
	});	
}