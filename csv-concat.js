var dir = require('node-dir');
var csv = require('ya-csv');
var path = require('path');


var writer = csv.createCsvFileWriter('./all-in-one.csv', {
	separator: ',', // must remove in writeStream.write()
	quote: '',
	escape: ''
});

writer.writeRecord(['project', 'index', 'date', 'files',
	'language',
	'blank',
	'comment',
	'code',
	'comment+code'
]);

dir.readFiles('/tmp/repos', {
	match: /.csv$/,
	recursive: false
}, function(err, content, filename, next) {
	var reader = csv.createCsvFileReader(filename, {
		//	columnsFromHeader: true,
		'separator': ','
	});

	reader.addListener('data', function(data) {
		if (this.parsingStatus.rows > 0) {
			var head = path.basename(filename, '.csv').split(',');
			console.log(head);
			data = data.concat(parseInt(data[3]) + parseInt(data[4]))
			console.log(data);
			writer.writeRecord(head.concat(data));
		}
	});
	reader.addListener('end', function() {
		//		console.log('thats it');
	});



	next();
});