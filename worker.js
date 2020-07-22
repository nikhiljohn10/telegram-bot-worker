
const bots = {
  'WhatAmIDoingNowBot': ENV_WhatAmIDoingNowBot,
  'PingTest007Bot': ENV_PingTest007Bot,
  'CareFree007Bot': ENV_CareFree007Bot
}

class Webhook {
  constructor(url, access_key) {
    this.access_key = access_key
    this.url = url
  }

  async set() {
    return await this.execute(this.url + '/setWebhook?url=https://bot.nikz.in/' + this.access_key)
  }

  async get() {
    return await this.execute(this.url + '/getWebhookInfo')
  }

  async delete() {
    return await this.execute(this.url + '/deleteWebhook')
  }

  async execute(url) {
    const response = await fetch(url)
    const result = await response.json()
    return JSONResponse(result)
  }
}

class BotModel {
  constructor(token, access_key) {
    this.token = token
    this.url = 'https://api.telegram.org/bot' + this.token
    this.webhook = new Webhook(this.url, access_key)
  }

  async sendMessage(msg, chatId, parse_mode = '') {
    await fetch(this.url + '/sendMessage?chat_id=' + chatId + '&text=' + msg + '&parse_mode=' + parse_mode)
  }

  async getMe() {
    return await this.webhook.execute(this.url + '/getMe')
  }
}

class Handler {
  constructor() {
    this.tokens = Object.values(bots)
    this.access_keys = this.tokens.map((token) => btoa(token).slice(0, -2))
    console.log(this.access_keys)
  }

  async handle(request) {
    const url = new URL(request.url)
    const url_key = url.pathname.substring(1).replace(/\/$/, "")
    const bot_id = this.access_keys.indexOf(url_key)

    this.bot = new TelegramBot(this.tokens[bot_id], this.access_keys[bot_id])

    const contentType = request.headers.get('content-type') || ''
    if (bot_id > -1) {

      if (request.method === 'POST' && contentType.includes('application/json')) {
        await this.bot.update(request)
        return new Response({ status: 200 })

      } else if (request.method === 'GET') {
        const command = url.searchParams.get('command')
        if (command == undefined) {
          return this.error("No command found", 404)
        }

        switch (command) {
          case 'setWebhook':
            return this.bot.webhook.set()
          case 'getWebhook':
            return this.bot.webhook.get()
          case 'delWebhook':
            return this.bot.webhook.delete()
          case 'getMe':
            return this.bot.getMe()
          case '':
            return this.error("No command found", 404)
          default:
            return this.error("Invalid command", 400)

        }
      }
    }
    return this.error("Invalid access key")
  }

  error(message, status = 403) {
    return JSONResponse({
      error: message
    }, status)
  }

}

class TelegramBot extends BotModel {
  constructor(token, access_key) {
    super(token, access_key)
  }

  async update(req) {
    const data = await req.json()
    const json_data = '<pre>' + JSON.stringify(data) + '</pre>'
    await this.sendMessage(data.message.text, data.message.chat.id, 'HTML')
  }
}

const handler = new Handler()

addEventListener('fetch', event => {
  event.respondWith(handler.handle(event.request))
})

function JSONResponse(data, status = 200) {
  const init = {
    status: status,
    headers: {
      'content-type': 'application/json'
    }
  }
  return new Response(JSON.stringify(data), init)
}
