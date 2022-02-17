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
  kanye: async (bot, req, args) => await bot.kanye(req, args),
  bored: async (bot, req, args) => await bot.bored(req, args),
  joke: async (bot, req, args) => await bot.joke(req, args),
  doge: async (bot, req, args) => await bot.doge(req, args),
  roll: async (bot, req, args) => await bot.roll(req, args),
  commandList: async (bot, req, args) => await bot.commandList(req, args),
};

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

// Generate InlineQueryResultArticle
const InlineQueryResultArticle = (content) => ({
  type: "article",
  id: sha256(content).toString(),
  title: content.toString(),
  input_message_content: {
    message_text: content.toString(),
  },
});

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

const getBaseURL = (url_string) => {
  const url = new URL(url_string);
  return `${url.protocol}//${url.host}/`;
};

export default {
  fetch: async (request, env, context) => {
    console.log(env.SECRET_TELEGRAM_API_TOKEN);
    const WORKER_URL = getBaseURL(request.url);
    console.log(WORKER_URL);

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
        const max_connections = 100;
        const allowed_updates = ["message"];
        return await this.execute(
          this.url +
            `/setWebhook?url=${encodeURIComponent(
              WORKER_URL + access_key
            )}&max_connections=${max_connections}&allowed_updates=${allowed_updates}&drop_pending=True`
        );
      }

      async get() {
        return await this.execute(this.url + "/getWebhookInfo");
      }

      async delete() {
        return await this.execute(this.url + "/deleteWebhook");
      }

      async execute(url) {
        return await fetch(url)
          .then((response) => response.json())
          .then((json) => {
            console.log(json);
            return json;
          })
          .then((json) => JSONResponse(json));
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

    class BotModel {
      constructor(config) {
        this.token = config.token;
        this.commands = config.commands;
        this.url = "https://api.telegram.org/bot" + config.token;
        this.webhook = new Webhook(this.url, config.token);
      }

      async update(request) {
        console.log("processing update");
        this.content = request.content;
        this.message = request.content.message;

        if (this.content.hasOwnProperty("inline_query")) {
          console.log("update has inline_query");
          console.log("passing update to executeInlineCommand");
          if (!(await this.executeInlineCommand(request))) {
            // don't send messages on invalid commands
          }
        } else if (this.content.hasOwnProperty("message")) {
          if (this.message.hasOwnProperty("text")) {
            console.log("update has text");
            console.log("passing update to executeCommand");

            // Test command and execute
            if (!(await this.executeCommand(request))) {
              // don't send messages on invalid commands
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
          }
        } else {
          // process unknown type
          console.log(this.content);
        }

        // return 200 OK response to every update request
        return new Response("True", {
          status: 200,
        });
      }

      // execute the inline custom bot commands from bot configurations
      async executeInlineCommand(req) {
        let inlinecmdArray = req.content.inline_query.query.split(" ");
        const inline_command = inlinecmdArray.shift();
        const isinlineCommand = Object.keys(this.commands).includes(
          inline_command
        );
        console.log({ isinlineCommand });
        if (isinlineCommand) {
          await this.commands[inline_command](this, req, inlinecmdArray);
          return true;
        }
        return false;
      }

      // execute the custom bot commands from bot configurations
      async executeCommand(req) {
        let cmdArray = this.message.text.split(" ");
        const command = cmdArray.shift();
        const isCommand = Object.keys(this.commands).includes(command);
        console.log({ command, isCommand });
        if (isCommand) {
          console.log({ this_commands: this.commands });
          await this.commands[command](this, req, cmdArray);
          return true;
        }
        return false;
      }

      // trigger answerInlineQuery command of BotAPI
      async answerInlineQuery(inline_query_id, results, cache_time = 0) {
        let url =
          this.url +
          "/answerInlineQuery?inline_query_id=" +
          inline_query_id +
          "&results=" +
          encodeURIComponent(
            JSON.stringify([InlineQueryResultArticle(results)])
          ) +
          "&cache_time=" +
          cache_time;
        console.log({ url });
        const response = fetch(url);
        console.log({ inline_query_response: await response });
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
        let url =
          this.url + "/sendMessage?chat_id=" + chat_id + "&text=" + text;

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
        let url =
          this.url + "/sendPhoto?chat_id=" + chat_id + "&photo=" + photo;

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
        let url =
          this.url + "/sendVideo?chat_id=" + chat_id + "&video=" + video;

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

    class TelegramBot extends BotModel {
      constructor(config) {
        super(config);
      }

      // bot command: /kanye
      async kanye(req, args) {
        const request = new Request("https://api.kanye.rest");

        await fetch(request)
          .then((response) => response.json())
          .then((json) => `Kanye says... ${json.quote}`)
          .then((content) => {
            if (req.content.inline_query) {
              this.answerInlineQuery(req.content.inline_query.id, [content]);
            } else {
              this.sendMessage(this.message.chat.id, content);
            }
          });
      }

      // bot command: /joke
      async joke(req, args) {
        const request = new Request("https://v2.jokeapi.dev/joke/Any");

        await fetch(request)
          .then((response) => response.json())
          .then((json) =>
            this.sendMessage(
              this.message.chat.id,
              json.setup +
                "\n\n" +
                "<tg-spoiler>" +
                json.delivery +
                "</tg-spoiler>",
              "HTML"
            )
          );
      }

      // bot command: /bored
      async doge(req, args) {
        const request = new Request("https://shibe.online/api/shibes");

        await fetch(request)
          .then((response) => response.json())
          .then((json) => this.sendPhoto(this.message.chat.id, json[0]));
      }

      // bot command: /bored
      async bored(req, args) {
        const request = new Request("https://boredapi.com/api/activity/");

        await fetch(request)
          .then((response) => response.json())
          .then((json) =>
            this.sendMessage(this.message.chat.id, json.activity)
          );
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
          .then((json) => (json[args[0]]?.final_balance ?? 0) / 100000000)
          .then((balance) => {
            const content = `${args[0]}\n\n${balance.toString()} BTC`;
            if (req.content.inline_query) {
              this.answerInlineQuery(req.content.inline_query.id, [content]);
            } else {
              this.sendMessage(this.message.chat.id, content);
            }
          });
      }

      // bot command: /roll
      async roll(req, args) {
        const outcome = Math.floor(Math.random() * (args[0] ?? 6 - 1 + 1) + 1);
        const content = (username, outcome) =>
          `@${username} rolled a ${
            args[0] ?? 6
          } sided die. it landed on ${outcome}`;
        console.log({ req });

        if (req.content.inline_query) {
          console.log("answering inline query");
          const username = req.content.inline_query.from.username;
          await this.answerInlineQuery(req.content.inline_query.id, [
            content(username, outcome),
          ]);
        } else {
          const username = this.message.from.username;
          await this.sendMessage(
            this.message.chat.id,
            content(username, outcome)
          );
        }
      }

      // bot command: /commandList
      async commandList(req, args) {
        const content = JSON.stringify(Object.keys(commands));
        await this.sendMessage(this.message.chat.id, content);
      }

      // bot command: /toss
      async toss(req, args) {
        const outcome = Math.floor(Math.random() * 2) == 0 ? "heads" : "tails";
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

          console.log({
            method: this.request.method,
            size: this.request.size,
            content: this.request.content.message,
          });

          if (this.request.method === "POST" && this.request.size > 6) {
            this.response = await this.bot.update(this.request);
          } else if (this.request.method === "GET") {
            console.log("processing get request");
            console.log("updating webhook");
            this.response = await this.bot.webhook.process(url);
            await this.bot.webhook.set();
          } else {
            console.log("invalid request recieved");
            this.response = this.error(this.request.content.error);
          }
        } else {
          this.response = this.error("Invalid access key");
        }

        // Log access keys to console if access key is not acceptable
        for (const id in this.access_keys)
          console.log(
            this.configs[id].bot_name,
            "Access Link:",
            WORKER_URL + this.access_keys[id]
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
        console.error(message);
        return JSONResponse(
          {
            error: message,
          },
          status
        );
      }
    }

    const bot_configs = [
      {
        bot_name: "CCMooniterBot",
        token: env.SECRET_TELEGRAM_API_TOKEN,
        commands: {
          "/chatInfo": commands.chatInfo,
          "/ping": commands.ping,
          "/toss": commands.toss,
          "/balance": commands.balance,
          "/epoch": commands.epoch,
          "/kanye": commands.kanye,
          "/bored": commands.bored,
          "/joke": commands.joke,
          "/doge": commands.doge,
          "/roll": commands.roll,
          "/commandList": commands.commandList,
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
