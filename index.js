'use strict';

var fs = require('fs');
var program = require('commander');
var getHotSpots = require('./lib');

program
	.version('0.0.1')
	.option('-t, --pivotal-api-token <token>', 'Pivotal API Token')
	.option('-p, --project-path <path>', 'git Project Path')
	.option('-i, --project-id <id>', 'Pivotal Project ID')
	.option('-o, --output <path>', 'CSV data output path')
	.parse(process.argv);

function writeData(err, scoresByFile) {
	if (err) {
		console.log(err);
	} else {
		var data = Object.keys(scoresByFile).map(function(key) {
			return {
				file: key,
				score: scoresByFile[key]
			};
		});
		data.sort(function(a, b) {
			return b.score - a.score;
		});
		var csv = 'File,Score';
		data.forEach(function(pt) {
			csv += '\n' + pt.file + ',' + pt.score;
		});
		fs.writeFileSync(program.output, csv);
	}
}

if (require.main === module) {
	if (!program.pivotalApiToken || !program.projectId || !program.projectPath || !program.output) {
		program.help();
	} else {
		getHotSpots(program.pivotalApiToken, program.projectId, program.projectPath, writeData);
	}
} else {
	module.exports = getHotSpots;
}