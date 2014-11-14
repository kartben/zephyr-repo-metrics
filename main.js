var csv = require('csv');

var request = require('request');

var sys = require('sys')
var exec = require('child_process').exec;


var PROJECTS = [
	'iot.smarthome',
	'iot.mihini',
	'iot.paho',
	'iot.eclipsescada',
	'iot.ponte',
	'iot.concierge',
	'iot.mosquitto',
	'iot.kura',
	'iot.krikkit',
	'iot.om2m',
	'iot.californium',
	'iot.wakaama',
	'iot.moquette'
]

var DATES = [
	"2012-01-01",
	"2012-02-01",
	"2012-03-01",
	"2012-04-01",
	"2012-05-01",
	"2012-06-01",
	"2012-07-01",
	"2012-08-01",
	"2012-09-01",
	"2012-10-01",
	"2012-11-01",
	"2012-12-01",
	"2013-01-01",
	"2013-02-01",
	"2013-03-01",
	"2013-04-01",
	"2013-05-01",
	"2013-06-01",
	"2013-07-01",
	"2013-08-01",
	"2013-09-01",
	"2013-10-01",
	"2013-11-01",
	"2013-12-01",
	"2014-01-01",
	"2014-02-01",
	"2014-03-01",
	"2014-04-01",
	"2014-05-01",
	"2014-06-01",
	"2014-07-01",
	"2014-08-01",
	"2014-09-01",
	"2014-10-01",
	"2014-11-01",
]


function computeRepositories() {
	var repositories = {};
	var idx = 0;

	for (var i in PROJECTS) {
		var p = PROJECTS[i];
		repositories[p] = []

		console.log('Requesting info for ' + p);

		request({
			url: 'https://projects.eclipse.org/json/project/' + p,
			json: true
		}, function(error, response, result) {
			if (!error && response.statusCode == 200) {
				for (var project in result.projects) {
					var source_repos = result.projects[project].source_repo

					for (var i in source_repos) {
						var url = source_repos[i].url;
						url = url.replace('http://git.eclipse.org/c/', 'http://git.eclipse.org/gitroot/')

						var path = '/tmp/repos/' + idx++;

						console.log('$ git clone ' + url + ' ' + path);
						exec('git clone ' + url + ' ' + path, gitclone_callback(project, url, path));
					}

				}
			}
		});

	}
}


function gitclone_callback(project, url, path) {
	return function() {
		console.log('[' + project + '] Clone of ' + url + ' in ' + path + ' ... done');

		cloc(project, path, DATES, 0);
	}
}

// hard code OM2M analysis
exec('git clone git://git.eclipse.org/gitroot/om2m/org.eclipse.om2m.git /tmp/repos/999', 
	gitclone_callback('iot.om2m', 'git://git.eclipse.org/gitroot/om2m/org.eclipse.om2m.git', '/tmp/repos/999'));

// hard code Wakaama analysis
exec('git clone https://github.com/eclipse/wakaama /tmp/repos/9999', 
	gitclone_callback('iot.wakaama', 'https://github.com/eclipse/wakaama', '/tmp/repos/9999'));



function cloc(project, path, dates, index) {
	if (index >= dates.length) return;
	var date = dates[index];
	var branch = 'master';
	if (project == 'iot.kura')
		branch = 'develop';

	console.log('GIT_DIR=' + path + '/.git git rev-list ' + branch + ' -n 1 --first-parent --before=' + date)
	exec('GIT_DIR=' + path + '/.git git rev-list ' + branch + ' -n 1 --first-parent --before=' + date, function(error, stdout, stderr) {
		console.log(path + ' - ' + date + ': ' + stdout);

		if (stdout) {
			console.log('$ git --git-dir=' + path + '/.git --work-tree=' + path + ' checkout ' + stdout);
			exec('git --git-dir=' + path + '/.git --work-tree=' + path + ' checkout ' + stdout, function(error, stdout, stderr) {
				if (!error) {
					var csv_filepath = path + '/../' + project + path.replace('/tmp/repos/', ',') + ',' + date + '.csv';
					console.log('$ cloc ' + path + ' --csv --report-file=' + csv_filepath);
					exec('cloc ' + path + ' --csv --report-file=' + csv_filepath, function(error, stdout, stderr) {
						if (!error) {
							cloc(project, path, dates, index + 1);
						} else {
							console.log(error);
						}
					});
				}
			});
		} else {
			cloc(project, path, dates, index + 1);
		}
	});
}

computeRepositories();