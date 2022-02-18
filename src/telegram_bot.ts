import Bot from "./bot";
import { logJSONinHTML } from "./libs";

export default class TelegramBot extends Bot {
  constructor(config) {
    super(config);
  }

  // bot command: /kanye
  kanye = async (req, args) =>
    fetch("https://api.kanye.rest")
      .then((response) => response.json())
      .then((json: any) => `Kanye says... ${json.quote}`)
      .then((content) => {
        if (req.content.inline_query) {
          return this.answerInlineQuery(
            req.content.inline_query.id,
            [content],
            0
          );
        } else {
          return this.sendMessage(req.content.message.chat.id, content);
        }
      });

  // bot command: /joke
  joke = async (req, args) =>
    fetch("https://v2.jokeapi.dev/joke/Any?blacklistFlags=racist")
      .then((response) => response.json())
      .then((json: any) => {
        const content = `${json.setup}\n\n<tg-spoiler>${json.delivery}</tg-spoiler>`;
        if (req.content.inline_query) {
          return this.answerInlineQuery(
            req.content.inline_query.id,
            [content],
            0,
            "HTML"
          );
        } else {
          return this.sendMessage(req.content.message.chat.id, content, "HTML");
        }
      });

  // bot command: /doge
  doge = async (req, args) =>
    fetch("https://shibe.online/api/shibes")
      .then((response) => response.json())
      .then((json) => this.sendPhoto(req.content.message.chat.id, json[0]));

  // bot command: /bored
  bored = async (req, args) =>
    fetch("https://boredapi.com/api/activity/")
      .then((response) => response.json())
      .then((json: any) =>
        this.sendMessage(req.content.message.chat.id, json.activity)
      );

  // bot command: /epoch
  epoch = async (req, args) =>
    this.sendMessage(req.content.message.chat.id, new Date().getTime());

  // bot command: /balance
  balance = async (req, args) =>
    fetch(`https://blockchain.info/balance?active=${args[0]}`)
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

  // bot command: /get
  _get = async (req, args) =>
    await this.kv
      .get(args[0])
      .then((value) => this.sendMessage(req.content.message.chat_id, value));

  // bot command: /set
  _set = async (req, args) =>
    this.kv
      .put(args[0], args[1])
      .then(this.sendMessage(req.content.message.chat.id, `set ${args[0]}`));

  _average = (numbers: number[]) =>
    parseFloat(
      (
        numbers.reduce((prev, cur) => prev + cur, 0) / numbers.length || 0
      ).toFixed(2)
    );

  // bot command: /average
  average = async (req, args) =>
    this.sendMessage(
      req.content.message.chat.id,
      this._average(this._numbers(100))
    );

  _numbers = (count = 100): number[] =>
    Array.from({ length: count ?? 100 }, () => Math.random()).map((x) =>
      parseFloat(x.toFixed(2))
    );

  // bot command: /numbers
  numbers = async (req, args) =>
    this.sendMessage(
      req.content.message.chat.id,
      "<pre>" + JSON.stringify(this._numbers(args[0])) + "</pre>",
      "HTML"
    );

  // bot command: /recursion
  recursion = async (req, args) =>
    Promise.all(
      Array.from({ length: 15 }, () =>
        this.sendMessage(req.content.message.chat.id, "/recursion")
      )
    );

  // bot command: /roll
  roll = async (req, args) => {
    const outcome = Math.floor(Math.random() * (args[0] ?? 6 - 1 + 1) + 1);
    const content = (username, outcome) =>
      `@${username} rolled a ${args[0] ??
        6} sided die. it landed on ${outcome}`;

    if (req.content.inline_query) {
      const username = req.content.inline_query.from.username;
      return this.answerInlineQuery(req.content.inline_query.id, [
        content(username, outcome),
      ]);
    } else {
      const username = req.content.message.from.username;
      return this.sendMessage(
        req.content.message.chat.id,
        content(username, outcome)
      );
    }
  };

  // bot command: /commandList
  commandList = async (req, args) =>
    this.sendMessage(
      req.content.message.chat.id,
      `<pre>${JSON.stringify(Object.keys(this.commands))}</pre>`,
      "HTML"
    );

  // bot command: /toss
  toss = async (req, args) =>
    this.sendMessage(
      req.content.message.chat.id,
      Math.floor(Math.random() * 2) == 0 ? "heads" : "tails"
    );

  // bot command: /ping
  ping = async (req, args) =>
    this.sendMessage(
      req.content.message.chat.id,
      args.length < 1 ? "pong" : args.join(" ")
    );

  // bot command: /chatInfo
  getChatInfo = async (req, args) =>
    this.sendMessage(
      req.content.message.chat.id,
      logJSONinHTML(req.content.message.chat),
      "HTML"
    );

  // Send all the profile pictures to user_id
  sendAllProfilePhotos = async (chat_id, user_id) =>
    this.getUserProfilePhotos(user_id).then((photos) =>
      photos.map((photo) => this.sendPhoto(chat_id, photo[0].file_id))
    );
}
