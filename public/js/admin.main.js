var tab = new dhtmlXTabBar({
	parent: layout,
	tabs:[
		{
			id:'general',
			text:'General'
		},
		{
			id:'configuration',
			text:'Configuration'
		},
		{
			id:'api',
			text:'API',
			active:true
		}
	]
});

tab.cells('general').appendObject('tabGeneralContent');
tab.cells('configuration').appendObject('tabConfigContent');
tab.cells('api').appendObject('tabAPIContent');


tab.cells('general').progressOn();

$.ajax({
	url:'/api/admin/data',
	dataType:'json'
})
.done(function(res){
	tab.cells('general').progressOff();

	if (res.status === 'success') {
		$('#summaryTotalReport').text(res.data.summary.total_report);
		$('#summaryPublicReport').text(res.data.summary.public_report);
		$('#summaryPrivateReport').text(res.data.summary.private_report);
		$('#summaryTotalUser').text(res.data.summary.total_user);

		var tableUserList = $('#tabConfigContent table.user');

		if (res.data.user.length === 0) {
			tableUserList.append('<tr><td colspan="4" class="nodata">No data.</td></tr>');
		} else {
			for (var n = 0; n < res.data.user.length; n++) {
				tableUserList.append('<tr><td>'+ (n+1) +'</td><td>'+ res.data.user[n].username +'</td><td>'+ res.data.user[n].type +'</td><td><a onclick="EditUser(\''+ res.data.user[n].username +'\')" href="javascript:void(0)"><img src="img/icons/pencil.png" alt="Edit" title="Edit"/></a><a onclick="RemoveUser(\''+ res.data.user[n].username +'\')" href="javascript:void(0)"><img src="img/icons/cross-script.png" alt="Remove" title="Remove"/></a></td></tr>');
			}
		}

		var apiContent = $('#tabAPIContent');
		var apiHTML = '';

		for (var key in res.data.api) {
			apiHTML += '<div class="panel">';
			apiHTML += '<h2>'+ key +'</h2>';

			for (var title in res.data.api[key]) {
				var param = '';
				
				if (res.data.api[key][title].param !== undefined) {
					for (var p = 0; p < res.data.api[key][title].param.length; p++) {
						param += res.data.api[key][title].param[p] + ', ';
					}
					param = param.slice(0, -2);
					param = '(' + param + ')';
				}

				apiHTML += '<p><b>'+ title +'</b> : '+ res.data.api[key][title].type.toUpperCase() +' <i><small>'+ param +'</small></i><br/>'+ res.data.api[key][title].description +'<br/><a class="path" href="'+ res.data.api[key][title].path +'" target="_blank">'+ res.data.api[key][title].path +'</a></p>'
			}

			apiHTML += '</div>';
		}

		apiContent.append(apiHTML);
	}
});

function Logout() {
	$.ajax({
		url:'/api/logout'
	}).done(function(){
		window.location.href = '/';
	});
}

function OpenReportDesigner() {
	window.location.href = '/designer';
}

function CreateUser() {
	var username = $('#tabConfigContent input.username').val();
	var password = $('#tabConfigContent input.password').val();
	var confirmPassword = $('#tabConfigContent input.confirmPassword').val();
	var type = $('#tabConfigContent select.type').val();

	if (username === '') {
		dhtmlx.message({
			title: "Close",
			type: "alert",
			text: "You can't close this window!",
			callback: function() {}
		});
		return false;
	}

	if (password === confirmPassword) {
		return false;
	}
}