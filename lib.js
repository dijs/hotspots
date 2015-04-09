'use strict';

var Pivotal = require('pivotaljs');
var async = require('async');
var spawn = require('child_process').spawn;

var oldestTime, now, timeDelta, projectPath, scoresByFile;

function getScore(time) {
	return 1 / (1 + Math.exp((-12 * time) + 12));
}

// time is 0..1, 0 is earliest point in code base, 1 is now
function normalizeTime(t) {
	return (t - oldestTime) / timeDelta;
}

function gitCommand(args, callback) {
	var output = '';
	var err = '';
	var git = spawn('git', args, {
		cwd: projectPath
	});
	git.stdout.on('data', function(data) {
		output += data;
	});
	git.stderr.on('data', function(data) {
		err += data;
	});
	git.on('close', function() {
		if (err.length) {
			callback(new Error(err));
		} else {
			callback(null, output.trim());
		}
	});
}

function getOldestCommit(callback) {
	gitCommand(['rev-list', '--max-parents=0', 'HEAD'], function(err, output) {
		if (err) {
			callback(err);
		} else {
			callback(null, output);
		}
	});
}

function getTimeForCommit(id, callback) {
	gitCommand(['show', '-s', '--format=%ct', id], function(err, output) {
		if (err) {
			callback(err);
		} else {
			callback(null, parseFloat(output) * 1000);
		}
	});
}

function getFilesForCommit(id, callback) {
	gitCommand(['diff-tree', '--no-commit-id', '--name-only', '-r', id], function(err, output) {
		if (err) {
			callback(err);
		} else {
			callback(null, output.split('\n').filter(function(file) {
				return file.length;
			}));
		}
	});
}

function handleCommit(id, callback) {
	getTimeForCommit(id, function(tErr, time) {
		if (tErr) {
			callback();
		} else {
			var score = getScore(normalizeTime(time));
			getFilesForCommit(id, function(fErr, files) {
				if (fErr) {
					callback();
				} else {
					files.forEach(function(file) {
						scoresByFile[file] = (scoresByFile[file] || 0) + score;
					});
					callback();
				}
			});
		}
	});
}

function byCommitId(comment) {
	return comment.commit_identifier;
}

function handleStory(story, done) {
	var commits = story.comments.filter(byCommitId).map(byCommitId);
	async.each(commits, handleCommit, done);
}

function handlePage(stories, pagination, callback) {
	async.each(stories, handleStory, callback);
}

module.exports = function(_pivotalApiToken, _pivotalProjectId, _projectPath, callback) {
	scoresByFile = {};
	projectPath = _projectPath;
	var pivotal = new Pivotal(_pivotalApiToken);
	async.waterfall([
		function(cb) {
			getOldestCommit(cb);
		},
		function(oldestCommitId, cb) {
			getTimeForCommit(oldestCommitId, cb);
		},
		function(time, cb) {
			oldestTime = time;
			now = +new Date();
			timeDelta = now - oldestTime;
			pivotal.getStories(_pivotalProjectId, {
				fields: 'comments',
				filter: 'type:bug includedone:true'
			}, handlePage, cb);
		}
	], function(err) {
		callback(err, scoresByFile);
	});
};