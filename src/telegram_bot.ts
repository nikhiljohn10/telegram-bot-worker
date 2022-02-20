import Bot from "./bot";
import { preTagString, prettyJSON } from "./libs";
import hasOwn from "core-js-pure/es/object/has-own";

export default class TelegramBot extends Bot {
  constructor(config) {
    super(config);
  }

  // bot command: /kanye
  kanye = async (content, args) =>
    fetch("https://api.kanye.rest")
      .then((response) => response.json())
      .then((json: any) => `Kanye says... ${json.quote}`)
      .then((message) => {
        if (content.inline_query) {
          return this.answerInlineQuery(content.inline_query.id, [message], 0);
        } else {
          return this.sendMessage(content.message.chat.id, message);
        }
      });

  // bot command: /joke
  joke = async (content, args) =>
    fetch("https://v2.jokeapi.dev/joke/Any?blacklistFlags=racist")
      .then((response) => response.json())
      .then((json: any) => {
        const message = `${json.setup}\n\n<tg-spoiler>${json.delivery}</tg-spoiler>`;
        if (content.inline_query) {
          return this.answerInlineQuery(
            content.inline_query.id,
            [message],
            0,
            "HTML"
          );
        } else {
          return this.sendMessage(content.message.chat.id, message, "HTML");
        }
      });

  // bot command: /doge
  doge = async (content, args) =>
    fetch("https://shibe.online/api/shibes")
      .then((response) => response.json())
      .then((json) => this.sendPhoto(content.message.chat.id, json[0]));

  // bot command: /bored
  bored = async (content, args) =>
    fetch("https://boredapi.com/api/activity/")
      .then((response) => response.json())
      .then((json: any) =>
        this.sendMessage(content.message.chat.id, json.activity)
      );

  // bot command: /epoch
  epoch = async (content, args) =>
    this.sendMessage(content.message.chat.id, new Date().getTime());

  // bot command: /balance
  balance = async (content, args) =>
    fetch(`https://blockchain.info/balance?active=${args[0]}`)
      .then((response) => response.json())
      .then((json: any) => (json[args[0]]?.final_balance ?? 0) / 100000000)
      .then((balance) => {
        const message = `${args[0]}\n\n${balance.toString()} BTC`;
        if (hasOwn(content, "inline_query")) {
          this.answerInlineQuery(
            content.inline_query.id,
            [message],
            7 * 60 // 7 minutes
          );
        } else {
          this.sendMessage(content.message.chat.id, message);
        }
      });

  // bot command: /get
  _get = async (content, args) =>
    hasOwn(this.kv, "get") &&
    this.kv
      .get(args[0])
      .then((value) => this.sendMessage(content.message.chat.id, value));

  // bot command: /set
  _set = async (content, args) =>
    hasOwn(this.kv, "put") &&
    this.kv
      .put(args[0], args[1])
      .then(this.sendMessage(content.message.chat.id, `set ${args[0]}`));

  _average = (numbers: number[]) =>
    parseFloat(
      (
        numbers.reduce((prev, cur) => prev + cur, 0) / numbers.length || 0
      ).toFixed(2)
    );

  // bot command: /average
  average = async (content, args) =>
    this.sendMessage(
      content.message.chat.id,
      this._average(this._numbers(100))
    );

  _numbers = (count = 100): number[] =>
    Array.from({ length: count ?? 100 }, () => Math.random()).map((x) =>
      parseFloat(x.toFixed(2))
    );

  // bot command: /numbers
  numbers = async (content, args) =>
    this.sendMessage(
      content.message.chat.id,
      preTagString(JSON.stringify(this._numbers(args[0]))),
      "HTML"
    );

  // bot command: /recursion
  recursion = async (content, args): Promise<Response> =>
    this.sendMessage(content.message.chat.id, "/recursion");

  // bot command: /roll
  roll = async (content, args) => {
    const outcome = Math.floor(Math.random() * (args[0] ?? 6 - 1 + 1) + 1);
    const message = (username, outcome) =>
      `@${username} rolled a ${args[0] ??
        6} sided die. it landed on ${outcome}`;

    if (hasOwn(content, "inline_query")) {
      const username = content.inline_query.from.username;
      return this.answerInlineQuery(content.inline_query.id, [
        message(username, outcome),
      ]);
    } else {
      const username = content.message.from.username;
      return this.sendMessage(
        content.message.chat.id,
        message(username, outcome)
      );
    }
  };

  // bot command: /commandList
  commandList = async (content, args) =>
    this.sendMessage(
      content.message.chat.id,
      `<pre>${JSON.stringify(Object.keys(this.commands))}</pre>`,
      "HTML"
    );

  // bot command: /toss
  toss = async (content, args) =>
    this.sendMessage(
      content.message.chat.id,
      Math.floor(Math.random() * 2) == 0 ? "heads" : "tails"
    );

  // bot command: /ping
  ping = async (content, args) =>
    this.sendMessage(
      content.message.chat.id,
      args.length < 1 ? "pong" : args.join(" ")
    );

  // bot command: /chatInfo
  getChatInfo = async (content, args) =>
    this.sendMessage(
      content.message.chat.id,
      preTagString(prettyJSON(content.message.chat)),
      "HTML"
    );

  // Send all the profile pictures to user_id
  sendAllProfilePhotos = async (chat_id, user_id) =>
    this.getUserProfilePhotos(user_id).then((photos) =>
      photos.map((photo) => this.sendPhoto(chat_id, photo[0].file_id))
    );
}
