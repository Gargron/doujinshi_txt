# doujinshi_txt bot

Markov chain bot that tweets stuff from doujinshi. Reads Twitter oAuth details from environment variables, supports dotenv. Example `.env`:

    TWIT_CONSUMER_KEY=
    TWIT_CONSUMER_SECRET=
    TWIT_ACCESS_TOKEN=
    TWIT_ACCESS_SECRET=

Running:

    npm install
    node markov.js

In the REPL:

* `tweetMarkovString()` to tweet random phrase
* `tweetString(string)` to tweet `string`
* `getMarkovString(len)` to generate random phrase of `len` words
* `getMarkovStringForWord(startingWord, len)` to generate random phrase starting with `startingWord` and `len` words long
* `markovChain` to inspect the internal data structure
* `startingWords` to inspect possible starting words

The recommended workflow is to check the generated string for sense/funniness before tweeting:

    var t = getMarkovString(20); t

That'll output the string to the REPL, you can use the up-arrow key to repeat it until something funny comes out. Then:

    tweetString(t)

The source texts in the `data` directory have been kindly provided by [@Zeroblade](https://twitter.com/Zeroblade) who translates that kinda stuff.

Canon incarnation of the bot is [@doujinshi_txt](https://twitter.com/doujinshi_txt).

### License

The code itself is very generic, so let's just say it's under the MIT license. The source texts
are fan-made translations of third-party works.
