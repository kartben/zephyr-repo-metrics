var dir = require('node-dir');
var csv = require('ya-csv');
var path = require('path');


var writer = csv.createCsvFileWriter('/Users/kartben/Desktop/all-in-one.csv', {
	separator: ',', // must remove in writeStream.write()
	quote: '',
	escape: ''
});

writer.writeRecord(['project', 'index', 'date', 'files',
	'language',
	'blank',
	'comment',
	'code'
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
			console.log(data);
			writer.writeRecord(head.concat(data));
		}
	});
	reader.addListener('end', function() {
		//		console.log('thats it');
	});



	next();
});