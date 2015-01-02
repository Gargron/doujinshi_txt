# doujinshi_txt bot

Markov chain bot that tweets stuff from doujinshi. Reads Twitter oAuth details from environment variables, supports dotenv. Example `.env`:

    TWIT_CONSUMER_KEY=
    TWIT_CONSUMER_SECRET=
    TWIT_ACCESS_TOKEN=
    TWIT_ACCESS_SECRET=

Running:

    npm install
    ./bin/doujinshi_txt --help

The source texts in the `data` directory have been kindly provided by [@Zeroblade](https://twitter.com/Zeroblade) who translates that kinda stuff.

Canon incarnation of the bot is [@doujinshi_txt](https://twitter.com/doujinshi_txt).

### License

The code itself is very generic, so let's just say it's under the MIT license. The source texts
are fan-made translations of third-party works.
