# moonitor

serverless telegram bot on cf workers

[`worker.ts`](https://github.com/codebam/moonitor/blob/master/src/worker.ts) is
the content of Nikhil John's
https://github.com/nikhiljohn10/telegram-bot-worker which is licensed with MIT.
It is modified and my modifications are licensed with the Apache license.

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/codebam/moonitor)

To use the deploy button:

- click the deploy button and fork the repo
- Navigate to your new **GitHub repository &gt; Settings &gt; Secrets** and add the following secrets:

   ```yaml
   - Name: CF_API_TOKEN (should be added automatically)
   - Name: CF_ACCOUNT_ID (should be added automatically)

   - Name: SECRET_TELEGRAM_API_TOKEN
   - Value: your-telegram-api-key
   ```

- Push to `master` to trigger a deploy

To fork this repo and use wrangler:

- click fork
- `wrangler secret put SECRET_TELEGRAM_API_TOKEN` and set it to your API key
- `wrangler publish`
- done!

