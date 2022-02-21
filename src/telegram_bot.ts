import Bot from "./bot";
import { preTagString, prettyJSON } from "./libs";
import {
  Joke,
  Bored,
  Balance,
  InlineQueryResultArticle,
  InlineQueryResultPhoto,
} from "./types";

export default class TelegramBot extends Bot {
  constructor(config) {
    super(config);
  }

  // bot command: /kanye
  kanye = async (update) =>
    fetch("https://api.kanye.rest")
      .then((response) => response.json())
      .then((json: { quote: string }) => `Kanye says... ${json.quote}`)
      .then((message) => {
        if (update.inline_query)
          return this.answerInlineQuery(
            update.inline_query.id,
            [new InlineQueryResultArticle(message)],
            0
          );
        return this.sendMessage(update.message.chat.id, message);
      });

  // bot command: /joke
  joke = async (update, args) =>
    fetch("https://v2.jokeapi.dev/joke/Any?safe-mode")
      .then((response) => response.json())
      .then((joke: Joke) => {
        const message =
          joke.joke ||
          `${joke.setup}\n\n<tg-spoiler>${joke.delivery}</tg-spoiler>`;
        if (update.inline_query) {
          return this.answerInlineQuery(
            update.inline_query.id,
            [new InlineQueryResultArticle(message, "HTML")],
            0
          );
        } else {
          return this.sendMessage(update.message.chat.id, message, "HTML");
        }
      });

  // bot command: /doge
  doge = async (update, args) =>
    fetch("https://shibe.online/api/shibes")
      .then((response) => response.json())
      .then((json: [string]) => {
        if (update.inline_query)
          return this.answerInlineQuery(
            update.inline_query.id,
            [new InlineQueryResultPhoto(json[0])],
            0
          );
        return this.sendPhoto(update.message.chat.id, json[0]);
      });

  // bot command: /bored
  bored = async (update, args) =>
    fetch("https://boredapi.com/api/activity/")
      .then((response) => response.json())
      .then((json: Bored) =>
        this.sendMessage(update.message.chat.id, json.activity)
      );

  // bot command: /epoch
  epoch = async (update, args) =>
    this.sendMessage(update.message.chat.id, new Date().getTime());

  // bot command: /balance
  balance = async (update, args) =>
    fetch(`https://blockchain.info/balance?active=${args[0]}`)
      .then((response) => response.json())
      .then((json: Balance) => (json[args[0]]?.final_balance ?? 0) / 100000000)
      .then((balance) => {
        const message = `${args[0]}\n\n${balance.toString()} BTC`;
        if (update.inline_query) {
          return this.answerInlineQuery(
            update.inline_query.id,
            [new InlineQueryResultArticle(message)],
            7 * 60 // 7 minutes
          );
        }
        return this.sendMessage(update.message.chat.id, message);
      });

  // bot command: /get
  _get = async (update, args) =>
    this.kv.get &&
    this.kv
      .get(args[0])
      .then((value) => this.sendMessage(update.message.chat.id, value));

  // bot command: /set
  _set = async (update, args) =>
    this.kv.put &&
    this.kv
      .put(args[0], args.slice(1).join(" "))
      .then(() => this.sendMessage(update.message.chat.id, `set ${args[0]}`));

  _average = (numbers: number[]) =>
    parseFloat(
      (
        numbers.reduce((prev, cur) => prev + cur, 0) / numbers.length || 0
      ).toFixed(2)
    );

  // bot command: /average
  average = async (update, args) =>
    this.sendMessage(update.message.chat.id, this._average(this._numbers(100)));

  _numbers = (count = 100): number[] =>
    Array.from({ length: count ?? 100 }, () => Math.random()).map((x) =>
      parseFloat(x.toFixed(2))
    );

  // bot command: /numbers
  numbers = async (update, args) =>
    this.sendMessage(
      update.message.chat.id,
      preTagString(JSON.stringify(this._numbers(args[0]))),
      "HTML"
    );

  // bot command: /recursion
  recursion = async (update, args): Promise<Response> =>
    this.sendMessage(update.message.chat.id, "/recursion").then((response) => {
      console.log({ response_____: response });
      return this.handler.postResponse(
        new Request("", { method: "POST", body: response.body }),
        this
      );
    });

  // bot command: /roll
  roll = async (update, args) => {
    const outcome = Math.floor(Math.random() * (args[0] ?? 6 - 1 + 1) + 1);
    const message = (username, outcome) =>
      `@${username} rolled a ${args[0] ??
        6} sided die. it landed on ${outcome}`;
    if (update.inline_query) {
      const username = update.inline_query.from.username;
      return this.answerInlineQuery(update.inline_query.id, [
        new InlineQueryResultArticle(message(username, outcome)),
      ]);
    }
    const username = update.message.from.username;
    return this.sendMessage(update.message.chat.id, message(username, outcome));
  };

  // bot command: /commandList
  commandList = async (update, args) =>
    this.sendMessage(
      update.message.chat.id,
      `<pre>${JSON.stringify(Object.keys(this.commands))}</pre>`,
      "HTML"
    );

  // bot command: /toss
  toss = async (update, args) =>
    this.sendMessage(
      update.message.chat.id,
      Math.floor(Math.random() * 2) == 0 ? "heads" : "tails"
    );

  // bot command: /ping
  ping = async (update, args) =>
    this.sendMessage(
      update.message.chat.id,
      args.length < 1 ? "pong" : args.join(" ")
    );

  // bot command: /chatInfo
  getChatInfo = async (update, args) =>
    this.sendMessage(
      update.message.chat.id,
      preTagString(prettyJSON(update.message.chat)),
      "HTML"
    );

  // Send all the profile pictures to user_id
  sendAllProfilePhotos = async (chat_id, user_id) =>
    this.getUserProfilePhotos(user_id).then((photos) =>
      photos.map((photo) => this.sendPhoto(chat_id, photo[0].file_id))
    );
}
