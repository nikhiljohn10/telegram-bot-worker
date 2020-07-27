# Telegram Bot Worker
A generic telegram bot using cloudflare workers and Telegram BOT API

### Features

 - Manage multiple bots in single script
 - No mantaince needed
 - Serverless deployment across the world by Cloudflare
 - High uptime and low latency
 - Log all request for debugging purpose
 - Connect to various APIs available online
 - SH256 encrypted token as URL Hash for secure access
 - Class based code for modularity
 
 ### How to create new worker
 
Go to URL, https://dash.cloudflare.com > Workers > Create a worker

Then you can copy paste the [worker.js](https://github.com/nikhiljohn10/telegram-bot-worker/blob/master/worker.js) content in the text editor

 ### Usage
 
 Edit `Bot Configurations` section for customising and add Cloudflare worker variable to access bot tokens
 
 Logger bot configuration can be disabled by setting `enabled` option to `false`
 
 Adding new methods to `Telegram Bot Endpoint` section will be added to the command pool in `Bot Configurations` section.
 
 If you need to implement more Telegram bot functionalities, `Generic Bot Class` section is the place to add them.
 

 ### How to set/get/delete Webhook?
 
 Go to URL `https://dash.cloudflare.com/{Cloudflare Account ID}/workers/edit/{Worker Name}`. This is where you edit the worker script.
 
 Click on SEND button to receive `{ "error": "Invalid access key" }` response. This will also log all the bot urls with hash values to access each bots. Log bot's access url is only logged if it is enabled in the configuration.
 
 Use this URLs to access webhooks.
 
 ```
 // If ENV_BOT_HOST_FQDN = https://bot.example.workers.dev/
 
 https://bot.example.workers.dev/{HASH_VALUE}/?command={COMMAND}
 
 Note: COMMANDS are case sensitive
 
 COMMANDS:
     setWebhook : Set the webhook to https://bot.example.workers.dev/{HASH_VALUE}
     getWebhook : Get the webhook information of referenced bot using hash value
     delWebhook : Delete the webhook of referenced bot using hash value
     getMe : Get all the informations about the referenced bot using hash value
     
Example: https://bot.example.workers.dev/d78607faf66861df3e66a180fe80388d78607faf?command=setWebhook // This will set the webhook
 
 ```
 
