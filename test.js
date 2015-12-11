/**
 * Ini adalah untuk simulate post dan get request
 * dan lihat apa result yang LNR hantar
 */

var request = require('request');

TestPreviewRecordsQuery();

function TestPreviewRecordsQuery() {
	var url = 'http://localhost:3000/api/designer/previewrecords';

	var data = {
		dhxr1449815096081: '1',
		connection: '{"name":"AAA","type":"mysql","host":"localhost","user":"root","password":"","dbname":"test","port":"3306","sid":"Hoho","serviceName":"Wuuuu","socket":"9090","undefined":"Reset"}',
		query: 'select * from test.peribadi where negeri = {{negeri}}',
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