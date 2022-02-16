"use strict";

////////////////////////////////////////////////////////////////////
////           Telegram Bot using Cloudflare Worker             ////
////////////////////////////////////////////////////////////////////
////  Author: Nikhil John                                       ////
////  Repo: https://github.com/nikhiljohn10/telegram-bot-worker ////
////  License: MIT                                              ////
////                                                            ////
////  Author: Sean Behan                                        ////
////  Repo: https://github.com/codebam/mooniter                 ////
////  License: Apache-2.0                                       ////
////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////
////  Custom Cloudflare Environment Variables ////
//////////////////////////////////////////////////

const ENV_BOT_HOST_FQDN = "https://moonitor.codebam.workers.dev/";

/////////////////////////////
////  Bot Configurations ////
/////////////////////////////

// List of all commands available
const commands = {
  chatInfo: async (bot, req, args) => await bot.getChatInfo(req, args),
  ping: async (bot, req, args) => await bot.ping(req, args),
  toss: async (bot, req, args) => await bot.toss(req, args),
  balance: async (bot, req, args) => await bot.balance(req, args),
  epoch: async (bot, req, args) => await bot.epoch(req, args),
};

///////////////////////////
////  Webhook Endpoint ////
///////////////////////////

class Webhook {
  constructor(url, token) {
    this.url = url;
    this.token = token;
  }

  // trigger getMe command of BotAPI
  async getMe() {
    return await this.execute(this.url + "/getMe");
  }

  async set() {
    const access_key = await sha256(this.token);
    return await this.execute(
      this.url + "/setWebhook?url=" + ENV_BOT_HOST_FQDN + access_key
    );
  }

  async get() {
    return await this.execute(this.url + "/getWebhookInfo");
  }

  async delete() {
    return await this.execute(this.url + "/deleteWebhook");
  }

  async execute(url) {
    const response = await fetch(url);
    const result = await response.json();
    return JSONResponse(result);
  }

  async process(url) {
    const command = url.searchParams.get("command");
    if (command == undefined) {
      return this.error("No command found", 404);
    }

    // handles the url commands
    switch (command) {
      case "setWebhook":
        return await this.set();
      case "getWebhook":
        return await this.get();
      case "delWebhook":
        return await this.delete();
      case "getMe":
        return await this.getMe();
      case "":
        return this.error("No command found", 404);
      default:
        return this.error("Invalid command", 400);
    }
  }

  // handles error responses
  error(message, status = 403) {
    return JSONResponse(
      {
        error: message,
      },
      status
    );
  }
}

////////////////////////////
////  Generic Bot Class ////
////////////////////////////

class BotModel {
  constructor(config) {
    this.token = config.token;
    this.commands = config.commands;
    this.url = "https://api.telegram.org/bot" + config.token;
    this.webhook = new Webhook(this.url, config.token);
  }

  // trigger sendAnimation command of BotAPI
  async update(request) {
    try {
      this.message = request.content.message;
      if (this.message.hasOwnProperty("text")) {
        // process text

        // Test command and execute
        if (!(await this.executeCommand(request))) {
          // Test is not a command
          await this.sendMessage(this.message.chat.id, "This is not a command");
        }
      } else if (this.message.hasOwnProperty("photo")) {
        // process photo
        console.log(this.message.photo);
      } else if (this.message.hasOwnProperty("video")) {
        // process video
        console.log(this.message.video);
      } else if (this.message.hasOwnProperty("animation")) {
        // process animation
        console.log(this.message.animation);
      } else if (this.message.hasOwnProperty("locaiton")) {
        // process locaiton
        console.log(this.message.locaiton);
      } else if (this.message.hasOwnProperty("poll")) {
        // process poll
        console.log(this.message.poll);
      } else if (this.message.hasOwnProperty("contact")) {
        // process contact
        console.log(this.message.contact);
      } else if (this.message.hasOwnProperty("dice")) {
        // process dice
        console.log(this.message.dice);
      } else if (this.message.hasOwnProperty("sticker")) {
        // process sticker
        console.log(this.message.sticker);
      } else if (this.message.hasOwnProperty("reply_to_message")) {
        // process reply of a message
        console.log(this.message.reply_to_message);
      } else {
        // process unknown type
        console.log(this.message);
      }
    } catch (error) {
      console.error(error);
      return JSONResponse(error.message);
    }
    // return 200 OK response to every update request
    return new Response("True", {
      status: 200,
    });
  }

  // execute the custom bot commands from bot configurations
  async executeCommand(req) {
    let cmdArray = this.message.text.split(" ");
    const command = cmdArray.shift();
    const isCommand = Object.keys(this.commands).includes(command);
    if (isCommand) {
      await this.commands[command](this, req, cmdArray);
      return true;
    }
    return false;
  }

  // trigger sendMessage command of BotAPI
  async sendMessage(
    chat_id,
    text,
    parse_mode = "",
    disable_web_page_preview = false,
    disable_notification = false,
    reply_to_message_id = 0
  ) {
    let url = this.url + "/sendMessage?chat_id=" + chat_id + "&text=" + text;

    url = addURLOptions(url, {
      parse_mode: parse_mode,
      disable_web_page_preview: disable_web_page_preview,
      disable_notification: disable_notification,
      reply_to_message_id: reply_to_message_id,
    });

    await fetch(url);
  }

  // trigger forwardMessage command of BotAPI
  async forwardMessage(
    chat_id,
    from_chat_id,
    disable_notification = false,
    message_id
  ) {
    let url =
      this.url +
      "/sendMessage?chat_id=" +
      chat_id +
      "&from_chat_id=" +
      from_chat_id +
      "&message_id=" +
      message_id;
    if (disable_notification)
      url += "&disable_notification=" + disable_notification;

    url = addURLOptions(url, {
      disable_notification: disable_notification,
    });

    await fetch(url);
  }

  // trigger sendPhoto command of BotAPI
  async sendPhoto(
    chat_id,
    photo,
    caption = "",
    parse_mode = "",
    disable_notification = false,
    reply_to_message_id = 0
  ) {
    let url = this.url + "/sendPhoto?chat_id=" + chat_id + "&photo=" + photo;

    url = addURLOptions(url, {
      caption: caption,
      parse_mode: parse_mode,
      disable_notification: disable_notification,
      reply_to_message_id: reply_to_message_id,
    });

    await fetch(url);
  }

  // trigger sendVideo command of BotAPI
  async sendVideo(
    chat_id,
    video,
    duration = 0,
    width = 0,
    height = 0,
    thumb = "",
    caption = "",
    parse_mode = "",
    supports_streaming = false,
    disable_notification = false,
    reply_to_message_id = 0
  ) {
    let url = this.url + "/sendVideo?chat_id=" + chat_id + "&video=" + video;

    url = addURLOptions(url, {
      duration: duration,
      width: width,
      height: height,
      thumb: thumb,
      caption: caption,
      parse_mode: parse_mode,
      supports_streaming: supports_streaming,
      disable_notification: disable_notification,
      reply_to_message_id: reply_to_message_id,
    });

    await fetch(url);
  }

  // trigger sendAnimation command of BotAPI
  async sendAnimation(
    chat_id,
    animation,
    duration = 0,
    width = 0,
    height = 0,
    thumb = "",
    caption = "",
    parse_mode = "",
    disable_notification = false,
    reply_to_message_id = 0
  ) {
    let url =
      this.url +
      "/sendAnimation?chat_id=" +
      chat_id +
      "&animation=" +
      animation;

    url = addURLOptions(url, {
      duration: duration,
      width: width,
      height: height,
      thumb: thumb,
      caption: caption,
      parse_mode: parse_mode,
      disable_notification: disable_notification,
      reply_to_message_id: reply_to_message_id,
    });

    await fetch(url);
  }

  // trigger sendLocation command of BotAPI
  async sendLocation(
    chat_id,
    latitude,
    longitude,
    live_period = 0,
    disable_notification = false,
    reply_to_message_id = 0
  ) {
    let url =
      this.url +
      "/sendLocation?chat_id=" +
      chat_id +
      "&latitude=" +
      latitude +
      "&longitude=" +
      longitude;

    url = addURLOptions(url, {
      live_period: live_period,
      disable_notification: disable_notification,
      reply_to_message_id: reply_to_message_id,
    });

    await fetch(url);
  }

  // trigger senPoll command of BotAPI
  async sendPoll(
    chat_id,
    question,
    options,
    is_anonymous = "", // Use 'false' to set it instead of Boolean false
    type = "",
    allows_multiple_answers = false,
    correct_option_id = 0,
    explanation = "",
    explanation_parse_mode = "",
    open_period = 0,
    close_date = 0,
    is_closed = false,
    disable_notification = false,
    reply_to_message_id = 0
  ) {
    let url =
      this.url +
      "/sendPoll?chat_id=" +
      chat_id +
      "&question=" +
      question +
      "&options=" +
      options;

    url = addURLOptions(url, {
      is_anonymous: is_anonymous,
      type: type,
      allows_multiple_answers: allows_multiple_answers,
      correct_option_id: correct_option_id,
      explanation: explanation,
      explanation_parse_mode: explanation_parse_mode,
      open_period: open_period,
      close_date: close_date,
      is_closed: is_closed,
      disable_notification: disable_notification,
      reply_to_message_id: reply_to_message_id,
    });

    await fetch(url);
  }

  // trigger senDice command of BotAPI
  async sendDice(
    chat_id,
    emoji = "",
    disable_notification = false,
    reply_to_message_id = 0
  ) {
    let url = this.url + "/sendDice?chat_id=" + chat_id;

    url = addURLOptions(url, {
      emoji: emoji,
      disable_notification: disable_notification,
      reply_to_message_id: reply_to_message_id,
    });

    await fetch(url);
  }

  // bot api command to get user profile photos
  async getUserProfilePhotos(user_id, offset = 0, limit = 0) {
    let url = this.url + "/getUserProfilePhotos?user_id=" + user_id;

    url = addURLOptions(url, {
      offset: offset,
      limit: limit,
    });

    const response = await fetch(url);
    const result = await response.json();
    return result.result.photos;
  }
}

/////////////////////////////////
////  Telegram Bot Endpoint ////
////////////////////////////////

class TelegramBot extends BotModel {
  constructor(config) {
    super(config);
  }

  // bot command: /epoch
  async epoch(req, args) {
    await this.sendMessage(this.message.chat.id, new Date().getTime());
  }

  // bot command: /balance
  async balance(req, args) {
    const request = new Request(
      `https://blockchain.info/balance?active=${args[0]}`
    );

    await fetch(request)
      .then((response) => response.json())
      .then((json) =>
        this.sendMessage(
          this.message.chat.id,
          (parseInt(json[args[0]].final_balance) / 100000000).toString() +
            " BTC"
        )
      );
  }

  // bot command: /toss
  async toss(req, args) {
    const outcome = Math.floor(Math.random() * 2) == 0 ? "Heads" : "Tails";
    await this.sendMessage(this.message.chat.id, outcome);
  }

  // bot command: /ping
  async ping(req, args) {
    const text = args.length < 1 ? "pong" : args.join(" ");
    await this.sendMessage(this.message.chat.id, text);
  }

  // bot command: /chatInfo
  async getChatInfo(req, args) {
    await this.sendMessage(
      this.message.chat.id,
      logJSONinHTML(this.message.chat),
      "HTML"
    );
  }

  // Send all the profile pictures to user_id
  async sendAllProfilePhotos(chat_id, user_id) {
    const profilePhotos = await this.getUserProfilePhotos(user_id);
    for (const item of profilePhotos) {
      await this.sendPhoto(chat_id, item[0].file_id);
    }
  }
}

//////////////////////////
////  Request Handler ////
//////////////////////////

class Handler {
  constructor(configs) {
    this.configs = configs;
    this.tokens = this.configs.map((item) => item.token);
    this.response = new Response();
  }

  // handles the request
  async handle(request) {
    const url = new URL(request.url);
    const url_key = url.pathname.substring(1).replace(/\/$/, "");

    this.access_keys = await Promise.all(
      this.tokens.map(async (token) => await sha256(token))
    );
    this.bot_id = this.access_keys.indexOf(url_key);

    console.log({ bot_id: this.bot_id });
    if (this.bot_id > -1) {
      this.request = await this.processRequest(request);

      this.bot = new TelegramBot({
        token: this.tokens[this.bot_id], // Bot Token
        access_key: this.access_keys[this.bot_id], // Access Key
        commands: this.configs[this.bot_id].commands, // Bot commands
      });

      if (
        this.request.method === "POST" &&
        this.request.size > 6 &&
        this.request.content.message
      )
        this.response = await this.bot.update(this.request);
      else if (this.request.method === "GET") {
        this.response = await this.bot.webhook.process(url);
        await this.bot.webhook.set();
      } else this.response = this.error(this.request.content.error);
    } else {
      this.response = this.error("Invalid access key");
    }

    // Log access keys to console if access key is not acceptable
    for (const id in this.access_keys)
      console.log(
        this.configs[id].bot_name,
        "Access Link:",
        ENV_BOT_HOST_FQDN + this.access_keys[id]
      );

    return this.response;
  }

  async processRequest(req) {
    let request = req;
    request.size = parseInt(request.headers["content-length"]) || 0;
    request.type = request.headers["content-type"] || "";
    if (request.cf) request.content = await this.getContent(request);
    else if (request.method == "GET")
      request.content = {
        message: "Accessing webhook",
      };
    else
      request.content = {
        message: "",
        error: "Invalid content type or body",
      };
    console.log(req);
    return request;
  }

  async getContent(request) {
    if (request.type.includes("application/json")) {
      return await request.json;
    } else if (request.type.includes("text/")) {
      return await request.text;
    } else if (request.type.includes("form")) {
      const formData = await request.formData;
      const body = {};
      for (const entry of formData.entries()) {
        body[entry[0]] = entry[1];
      }
      return body;
    } else {
      return await request.arrayBuffer;
    }
  }

  // handles error responses
  error(message, status = 403) {
    return JSONResponse(
      {
        error: message,
      },
      status
    );
  }
}

////////////////////////////
////  Utility functions ////
////////////////////////////

// Generate JSON response
function JSONResponse(data, status = 200) {
  const init = {
    status: status,
    headers: {
      "content-type": "application/json",
    },
  };
  return new Response(JSON.stringify(data, null, 2), init);
}

// SHA256 Hash function
async function sha256(message) {
  // encode as UTF-8
  const msgBuffer = new TextEncoder().encode(message);
  // hash the message
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  // convert bytes to hex string
  const hashHex = hashArray
    .map((b) => ("00" + b.toString(16)).slice(-2))
    .join("");
  return hashHex;
}

// Stringify JSON and add <pre> tag HTML
function logJSONinHTML(data) {
  return preTagString(JSON.stringify(data, null, 2));
}

function preTagString(str) {
  return "<pre>" + str + "</pre>";
}

// Add options in URL
function addURLOptions(urlstr, options = {}) {
  let url = urlstr;
  for (const key of Object.keys(options)) {
    if (options[key]) url += "&" + key + "=" + options[key];
  }
  return url;
}

export default {
  fetch: async (request, env, context) => {
    const bot_configs = [
      {
        bot_name: "CCMooniterBot",
        token: env.ENV_CCMoonitorBot,
        commands: {
          "/chatInfo": commands.chatInfo,
          "/ping": commands.ping,
          "/toss": commands.toss,
          "/balance": commands.balance,
          "/epoch": commands.epoch,
        },
      },
    ];

    const handler = new Handler(bot_configs);

    return handler.handle({
      url: request.url,
      method: request.method,
      headers: {
        "cf-connecting-ip": request.headers.get("cf-connecting-ip"),
        "content-length": request.headers.get("content-length"),
        "content-type": request.headers.get("content-type"),
      },
      cf: request.cf,
      json: request.json(),
      text: request.text(),
      formData: request.formData(),
      arrayBuffer: request.arrayBuffer(),
    });
  },
};
