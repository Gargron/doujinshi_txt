var fs   = require('fs'),
  repl   = require('repl'),
  Twit   = require('twit'),
  dotenv = require('dotenv');

var loadFiles, buildFromCorpus, buildFromLine, nextChoice, getMarkovString, getMarkovStringForWord,
  tweetMarkovString, tweetString;

var markovChain = {},
  startingWords = [],
  r;

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

        // Build a Markov Chain for every source text
        buildFromCorpus(data);
      });
    });
  });
};

buildFromCorpus = function (data) {
  // Eliminate Windows linebreaks, double linebreaks
  var lines = data.toString().replace("\r", "").replace("\n\n", "\n").split("\n");

  // Remove empty lines
  lines = lines.map(function (line) {
    return line.trim();
  }).filter(function (line) {
    return line.length > 0;
  });

  lines.forEach(function (line) {
    // Process each line individually
    buildFromLine(line);
  });
};

buildFromLine = function (line) {
  // Eliminate any characters other than letters/numbers, spaces,
  // dashes and apostrophes
  var words = line.replace(/[^\w\s\-\']/g, ' ').split(' '),
    triple, key;

  // Remove empty "words"
  words = words.map(function (word) {
    return word.trim();
  }).filter(function (word) {
    return word.length > 0;
  });

  // Working with k-grams where k = 2
  if (words.length < 3) {
    return;
  }

  // Add first k-gram of line to the list of possible starting words
  if (typeof words[0] !== 'undefined') {
    startingWords.push([words[0], words[1]].map(function (word) {
      return word.toLowerCase();
    }).join(':'));
  }

  // Build the actual network
  for (var i = 0; i < words.length - 2; i += 1) {
    triple = [words[i], words[i + 1], words[i + 2]].map(function (word) {
      return word.toLowerCase();
    });

    key = triple[0] + ':' + triple[1];

    if (markovChain.hasOwnProperty(key)) {
      markovChain[key].push(triple[2]);
    } else {
      markovChain[key] = [triple[2]];
    }
  };
};

nextChoice = function (currentWord) {
  var possibleWords, decision;

  possibleWords = markovChain[currentWord];

  // What if we don't know of any follow-up to this word?
  if (typeof possibleWords === 'undefined') {
    // For now: End output preemptively
    return null;
  }

  decision = Math.floor(Math.random() * possibleWords.length);

  return [(currentWord.split(':'))[1], possibleWords[decision]].join(':');
};

getMarkovString = function (len) {
  var startingIndex = Math.floor(Math.random() * startingWords.length);

  return getMarkovStringForWord(startingWords[startingIndex], len);
};

getMarkovStringForWord = function (start, len) {
  var stringArr = [],
    nextWord    = start;

  stringArr.push((nextWord.split(':'))[0]);

  while (nextWord !== null && stringArr.length < len) {
    stringArr.push((nextWord.split(':'))[1]);
    nextWord = nextChoice(nextWord);
  }

  // Capitalize first word of the output, and end it with a period
  stringArr = stringArr.map(function (word, i) {
    if (i === 0) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    } else if (i === stringArr.length - 1) {
      return word + '.';
    } else {
      return word;
    }
  });

  return stringArr.join(' ');
};

tweetMarkovString = function () {
  var string = getMarkovString(20);
  tweetString(string);
};

tweetString = function (string) {
  var T = new Twit({
    consumer_key:        process.env.TWIT_CONSUMER_KEY,
    consumer_secret:     process.env.TWIT_CONSUMER_SECRET,
    access_token:        process.env.TWIT_ACCESS_TOKEN,
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

r.context.startingWords          = startingWords;
r.context.markovChain            = markovChain;
r.context.getMarkovString        = getMarkovString;
r.context.getMarkovStringForWord = getMarkovStringForWord;
r.context.tweetMarkovString      = tweetMarkovString;
r.context.tweetString            = tweetString;
