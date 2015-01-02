var fs = require('fs'),
  Twit = require('twit');

var MarkovGenerator;

MarkovGenerator = function () {
  this.markovChain   = {};
  this.startingWords = [];
};

MarkovGenerator.prototype.loadFiles = function (callback) {
  var pathToData = __dirname + '/data/',
    buildFromCorpus = this.buildFromCorpus.bind(this);

  fs.readdir(pathToData, function (err, files) {
    var todo = files.length;

    if (err) {
      console.error('Could not read directory: ' + err);
      return;
    }

    files.forEach(function (path) {
      fs.readFile(pathToData + path, function (err1, data) {
        if (err1) {
          console.error('Could not read file ' + path + ': ' + err1);
          return;
        }

        // Build a Markov Chain for every source text
        buildFromCorpus(data);

        // Execute callback when all source files are done
        todo -= 1;

        if (todo === 0) {
          callback();
        }
      });
    });
  });
};

MarkovGenerator.prototype.buildFromCorpus = function (data) {
  // Eliminate Windows linebreaks, double linebreaks
  var lines = data.toString().replace("\r", "").replace("\n\n", "\n").split("\n"),
    buildFromLine = this.buildFromLine.bind(this);

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

MarkovGenerator.prototype.buildFromLine = function (line) {
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
    this.startingWords.push([words[0], words[1]].map(function (word) {
      return word.toLowerCase();
    }).join(':'));
  }

  // Build the actual network
  for (var i = 0; i < words.length - 2; i += 1) {
    triple = [words[i], words[i + 1], words[i + 2]].map(function (word) {
      return word.toLowerCase();
    });

    key = triple[0] + ':' + triple[1];

    if (this.markovChain.hasOwnProperty(key)) {
      this.markovChain[key].push(triple[2]);
    } else {
      this.markovChain[key] = [triple[2]];
    }
  };
};

MarkovGenerator.prototype.nextChoice = function (currentWord) {
  var possibleWords, decision;

  possibleWords = this.markovChain[currentWord];

  // What if we don't know of any follow-up to this word?
  if (typeof possibleWords === 'undefined') {
    // For now: End output preemptively
    return null;
  }

  decision = Math.floor(Math.random() * possibleWords.length);

  return [(currentWord.split(':'))[1], possibleWords[decision]].join(':');
};

MarkovGenerator.prototype.getMarkovString = function (len) {
  var startingIndex = Math.floor(Math.random() * this.startingWords.length);

  return this.getMarkovStringForWord(this.startingWords[startingIndex], len);
};

MarkovGenerator.prototype.getMarkovStringForWord = function (start, len) {
  var stringArr = [],
    nextWord    = start;

  stringArr.push((nextWord.split(':'))[0]);

  while (nextWord !== null && stringArr.length < len) {
    stringArr.push((nextWord.split(':'))[1]);
    nextWord = this.nextChoice(nextWord);
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

MarkovGenerator.prototype.tweetMarkovString = function () {
  var string = this.getMarkovString(20);
  this.tweetString(string);
};

MarkovGenerator.prototype.tweetString = function (string) {
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

module.exports = MarkovGenerator;
