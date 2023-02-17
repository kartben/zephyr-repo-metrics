var csv = require('csv');

var request = require('request');

var sys = require('sys')
var exec = require('child_process').exec;

var moment = require("moment");

var fs = require('fs');


var DATES = []

var m = moment("2019-01-31");
var beginningOfCurrentMonth = moment().startOf('month')

while (m.isBefore(beginningOfCurrentMonth)) {
    DATES.push(m.format('YYYY-MM-DD'));
    m.add(1, 'month').endOf('month');
}

function computeRepositories() {
    var url = 'https://github.com/zephyrproject-rtos/zephyr'
    var path = '/tmp/repos/zephyr'
    
    exec('git clone ' + url + ' ' + path, gitclone_callback('zephyr', url, path));

}


function gitclone_callback(project, url, path) {
    return function() {
        console.log('[' + project + '] Clone of ' + url + ' in ' + path + ' ... done');

        cloc(project, path, DATES, 0);
    }
}


function cloc(project, path, dates, index) {
    if (index >= dates.length) return;
    var date = dates[index];
    var branch = 'main';

    var sensordrivers_csv_filepath = path + '/../' + project + '_[sensordrivers].csv';
    if(index == 0) {
        fs.unlink(sensordrivers_csv_filepath, (err) => {})
    }
                    

    // console.log('GIT_DIR=' + path + '/.git git rev-list ' + branch + ' -n 1 --first-parent --before=' + date)
    exec('GIT_DIR=' + path + '/.git git rev-list ' + branch + ' -n 1 --first-parent --before=' + date, function(error, stdout, stderr) {
        //console.log(path + ' - ' + date + ': ' + stdout);

        if (stdout) {
            // console.log('$ git --git-dir=' + path + '/.git --work-tree=' + path + ' checkout ' + stdout);
            exec('git --git-dir=' + path + '/.git --work-tree=' + path + ' checkout ' + stdout, function(error, stdout, stderr) {
                if (!error) {
                    var csv_filepath = path + '/../' + project + path.replace('/tmp/repos/', ',') + ',' + date + '.csv';
                    
                    // console.log('$ cloc --processes=32 ' + path + ' --csv --report-file=' + csv_filepath);
                    //exec('cloc --processes=32 ' + path + ' --csv --report-file=' + csv_filepath, function(error, stdout, stderr) {

                     exec('find ' + path + '/dts/bindings/sensor -type f | wc -l| awk \'{print "'+ date +',"$1}\' >> ' +sensordrivers_csv_filepath, function(error, stdout, stderr) {
                        if (!error) {
                            console.log(stdout);
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
