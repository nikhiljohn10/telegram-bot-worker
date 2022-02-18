import Bot from "./bot";
import { logJSONinHTML } from "./libs";

export default class TelegramBot extends Bot {
  constructor(config) {
    super(config);
  }

  // bot command: /kanye
  async kanye(req, args) {
    const request = new Request("https://api.kanye.rest");

    await fetch(request)
      .then((response) => response.json())
      .then((json: any) => `Kanye says... ${json.quote}`)
      .then((content) => {
        if (req.content.inline_query) {
          this.answerInlineQuery(
            req.content.inline_query.id,
            [content],
            10 * 60 // 10 minutes
          );
        } else {
          this.sendMessage(req.content.message.chat.id, content);
        }
      });
  }

  // bot command: /joke
  async joke(req, args) {
    const request = new Request("https://v2.jokeapi.dev/joke/Any");

    await fetch(request)
      .then((response) => response.json())
      .then((json: any) =>
        this.sendMessage(
          req.content.message.chat.id,
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
      .then((json) =>
        req.content.sendPhoto(req.content.message.chat.id, json[0])
      );
  }

  // bot command: /bored
  async bored(req, args) {
    const request = new Request("https://boredapi.com/api/activity/");

    await fetch(request)
      .then((response) => response.json())
      .then((json: any) =>
        this.sendMessage(req.content.message.chat.id, json.activity)
      );
  }

  // bot command: /epoch
  async epoch(req, args) {
    await this.sendMessage(req.content.message.chat.id, new Date().getTime());
  }

  // bot command: /balance
  async balance(req, args) {
    const request = new Request(
      `https://blockchain.info/balance?active=${args[0]}`
    );

    await fetch(request)
      .then((response) => response.json())
      .then((json: any) => (json[args[0]]?.final_balance ?? 0) / 100000000)
      .then((balance) => {
        const content = `${args[0]}\n\n${balance.toString()} BTC`;
        if (req.content.inline_query) {
          this.answerInlineQuery(
            req.content.inline_query.id,
            [content],
            7 * 60 // 7 minutes
          );
        } else {
          this.sendMessage(req.content.message.chat.id, content);
        }
      });
  }

  _average = (numbers) =>
    numbers.reduce((prev, cur) => prev + cur, 0) / numbers.length || 0;

  // bot command: /average
  average = async (req, args) =>
    this.sendMessage(req.content.message.chat.id, this._average(this._numbers));

  _numbers = (count = 100) =>
    Array.from({ length: count ?? 100 }, () => Math.random()).map((x) =>
      x.toFixed(2)
    );

  // bot command: /numbers
  async numbers(req, args) {
    this.sendMessage(
      req.content.message.chat.id,
      "<pre>" + JSON.stringify(this._numbers(args[0])) + "</pre>",
      "HTML"
    );
  }

  // bot command: /recursion
  async recursion(req, args) {
    const content = "/recursion";
    await Promise.all(
      Array.from({ length: 15 }, () =>
        this.sendMessage(req.content.message.chat.id, content)
      )
    );
  }

  // bot command: /roll
  async roll(req, args) {
    const outcome = Math.floor(Math.random() * (args[0] ?? 6 - 1 + 1) + 1);
    const content = (username, outcome) =>
      `@${username} rolled a ${args[0] ??
        6} sided die. it landed on ${outcome}`;

    if (req.content.inline_query) {
      const username = req.content.inline_query.from.username;
      await this.answerInlineQuery(req.content.inline_query.id, [
        content(username, outcome),
      ]);
    } else {
      const username = req.content.message.from.username;
      await this.sendMessage(
        req.content.message.chat.id,
        content(username, outcome)
      );
    }
  }

  // bot command: /commandList
  async commandList(req, args) {
    const content = JSON.stringify(Object.keys(this.commands));
    await this.sendMessage(
      req.content.message.chat.id,
      "<pre>" + content + "</pre>",
      "HTML"
    );
  }

  // bot command: /toss
  async toss(req, args) {
    const outcome = Math.floor(Math.random() * 2) == 0 ? "heads" : "tails";
    await this.sendMessage(req.content.message.chat.id, outcome);
  }

  // bot command: /ping
  async ping(req, args) {
    const text = args.length < 1 ? "pong" : args.join(" ");
    await this.sendMessage(req.content.message.chat.id, text);
  }

  // bot command: /chatInfo
  async getChatInfo(req, args) {
    await this.sendMessage(
      req.content.message.chat.id,
      logJSONinHTML(req.content.message.chat),
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
