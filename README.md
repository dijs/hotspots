# Hotspots

[![NPM Version][npm-image]][npm-url]

## About

This tool uses Pivotal to identify which commits in your project are bug fixes, then analyzes those commits in your local git project to find which parts of your codebase need more attention. This is an implementation of the bug prediction [solution](http://google-engtools.blogspot.com/2011/12/bug-prediction-at-google.html) a Google engineer posted. The difference being that instead of relying upon git commit messages, we can use other tools to provide identification of bug fix commits. 

## Dependencies

In order to analyze your codebase, your project must have been using:

- a git repo
- Pivotal Tracker
- Pivotal Tracker Integration with Github

*I am hoping to have more tool integration options other than Pivotal in the future.*

## Installation

```bash
$ npm install -g hotspots
```

*The global is optional.*

## How to Use

You can use this tool as a command line utility or as a library

```bash
$ hotspots --help
```
The command line tool writes the file/score data to a csv file path of your choice, for easy visualization.

```js
var findHotspots = require('hotspots');
findHotspots('<Pivotal API Token>', '<Project ID>', '<Project Path>', function(err, scoresByFile){
	// Do something great!
});
```

## Contributing

I welcome all those who would like to help. All I ask is that you run your changes through the gulp eslint task before creating a pull request.