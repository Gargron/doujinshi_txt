var fs = require('fs'),
  repl = require('repl'),
  Twit = require('twit'),
  dotenv = require('dotenv');

var loadFiles, buildFromCorpus, buildFromLine, nextChoice, getMarkovString, getMarkovStringForWord,
  tweetMarkovString;

var markovChain = {}, startingWords = [], r;

loadFiles = function () {
  fs.readdir(__dirname + '/data/', function (err, files) {
    if (err) {
      console.error('Could not read directory: ' + err);
      return;
    }

    files.forEach(function (path) {
      fs.readFile(__dirname + '/data/' + path, function (err1, data) {
        if (err1) {
          console.error('Could not read file ' + path + ': ' + err1);
          return;
        }

        buildFromCorpus(data);
      });
    });
  });
};

buildFromCorpus = function (data) {
  var lines = data.toString().replace("\r", "").replace("\n\n", "\n").split("\n");

  lines = lines.map(function (line) {
    return line.trim();
  }).filter(function (line) {
    return line.length > 0;
  });

  lines.forEach(function (line) {
    buildFromLine(line);
  });
};

buildFromLine = function (line) {
  var words = line.replace(/[^\w\s\!\?]/g, ' ').split(' ');

  words = words.map(function (word) {
    return word.trim();
  }).filter(function (word) {
    return word.length > 0;
  });

  if (typeof words[0] !== 'undefined') {
    startingWords.push(words[0].toLowerCase());
  }

  for (var i = 0; i < words.length - 1; i += 1) {
    var word = words[i].toLowerCase(),
      nextWord = words[i + 1].toLowerCase();

    if (markovChain.hasOwnProperty(word)) {
      markovChain[word].push(nextWord);
    } else {
      markovChain[word] = [nextWord];
    }
  };
};

nextChoice = function (currentWord) {
  var possibleWords, decision;

  possibleWords = markovChain[currentWord];

  if (typeof possibleWords === 'undefined') {
    return null;
  }

  decision = Math.floor(Math.random() * possibleWords.length);

  return possibleWords[decision];
};

getMarkovString = function (len) {
  var startingIndex = Math.floor(Math.random() * startingWords.length);

  return getMarkovStringForWord(startingWords[startingIndex], len);
};

getMarkovStringForWord = function (start, len) {
  var stringArr = [],
    nextWord = start;

  while (nextWord !== null && stringArr.length < len) {
    stringArr.push(nextWord);
    nextWord = nextChoice(nextWord);
  }

  return stringArr.join(' ');
};

tweetMarkovString = function () {
  var string = getMarkovString(20);

  var T = new Twit({
    consumer_key: process.env.TWIT_CONSUMER_KEY,
    consumer_secret: process.env.TWIT_CONSUMER_SECRET,
    access_token: process.env.TWIT_ACCESS_TOKEN,
    access_token_secret: process.env.TWIT_ACCESS_SECRET
  });

  T.post('statuses/update', { status: string }, function (err, data, response) {
    if (err) {
      console.error('Error tweeting: ' + err);
      return;
    }

    console.log('Tweeted: ' + string);
  });
};


dotenv.load();
loadFiles();

r = repl.start({
  prompt: 'doujinshi_txt>'
});

r.context.startingWords = startingWords;
r.context.markovChain = markovChain;
r.context.getMarkovString = getMarkovString;
r.context.getMarkovStringForWord = getMarkovStringForWord;
r.context.tweetMarkovString = tweetMarkovString;
