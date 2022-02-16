# moonitor

serverless telegram bot on cf workers

[`worker.js`](https://github.com/codebam/moonitor/blob/master/src/worker.js) is
the content of Nikhil John's
https://github.com/nikhiljohn10/telegram-bot-worker which is licensed with MIT.
It is modified and my modifications are licensed with the Apache license.

To fork this repo:

- click fork
- rename the bot in `src/worker.js`
- `wrangler secret put ENV_CCMoonitorBot` and set it to your API key
- `wrangler publish`
- done!
