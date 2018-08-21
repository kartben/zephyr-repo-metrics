var csv = require('csv');

var request = require('request');

var sys = require('sys')
var exec = require('child_process').exec;

var moment = require("moment");

var PROJECTS = [
    'iot.4diac',
    'iot.agail',
    'iot.californium',
    'iot.concierge',
    'iot.cyclonedds',
    'iot.ditto',
    'iot.duttile',
    'iot.eclipsescada',
    'iot.edje',
    'iot.fog05',
    'iot.hawkbit',
    'iot.hip',
    'iot.hono',
    'iot.ignite',
    'iot.iofog',
    'iot.kapua',
    'iot.keti',
    'iot.kuksa',
    'iot.kura',
    'iot.leshan',
    'iot.milo',
    'iot.mita',
    'iot.mosquitto',
    'iot.om2m',
    'iot.paho.incubator',
    'iot.paho',
//    'iot.ponte',
//    'iot.risev2g',
    'iot.smarthome',
    'iot.tahu',
    'iot.thingweb',
//    'iot.tiaki',
    'iot.thingweb',
    'iot.tinydtls',
    'iot.unide',
    'iot.volttron',
    'iot.vorto',
    'iot.wakaama',
    'iot.whiskers'
//    'iot.mihini',

]

var DATES = []

var m = moment("2017-01-31");
var beginningOfCurrentMonth = moment().startOf('month')

while (m.isBefore(beginningOfCurrentMonth)) {
    DATES.push(m.format('YYYY-MM-DD'));
    m.add(1, 'month').endOf('month');
}

// console.log(DATES);

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

// // hard code OM2M analysis
// exec('git clone git://git.eclipse.org/gitroot/om2m/org.eclipse.om2m.git /tmp/repos/999',
//     gitclone_callback('iot.om2m', 'git://git.eclipse.org/gitroot/om2m/org.eclipse.om2m.git', '/tmp/repos/999'));

// // hard code Wakaama analysis
// exec('git clone https://github.com/eclipse/wakaama /tmp/repos/9999',
//     gitclone_callback('iot.wakaama', 'https://github.com/eclipse/wakaama', '/tmp/repos/9999'));

// // hard code Leshan analysis
// exec('git clone https://github.com/jvermillard/leshan /tmp/repos/888',
//     gitclone_callback('iot.leshan', 'https://github.com/jvermillard/leshan', '/tmp/repos/888'));



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
