import Bot from "./bot";
import { preTagString, prettyJSON, addSearchParams } from "./libs";
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
  // bot command: /duckduckgo
  duckduckgo = async (update, args): Promise<Response> =>
    ((query) =>
      ((duckduckgo_url) =>
        ((update.inline_query &&
          query === "" &&
          this.answerInlineQuery(update.inline_query.id, [
            new InlineQueryResultArticle("https://duckduckgo.com"),
          ])) ||
          fetch(
            addSearchParams(new URL("https://api.duckduckgo.com"), {
              q: query,
              format: "json",
              t: "telegram_bot",
              no_redirect: "1",
            }).href
          ).then((response) =>
            response
              .json()
              .then(
                (results: {
                  AbstractSource: string;
                  AbstractURL: string;
                  Redirect: string;
                  Image: string;
                  RelatedTopics: { Icon: { URL: string } }[];
                }) =>
                  ((instant_answer_url, thumb_url, default_thumb_url) =>
                    this.answerInlineQuery(
                      update.inline_query.id,
                      (instant_answer_url !== "" && [
                        new InlineQueryResultArticle(
                          `${instant_answer_url}\n\n<a href="${duckduckgo_url}">Results From DuckDuckGo</a>`,
                          instant_answer_url,
                          "HTML",
                          thumb_url
                        ),
                        new InlineQueryResultArticle(
                          duckduckgo_url,
                          duckduckgo_url,
                          "",
                          default_thumb_url
                        ),
                      ]) || [
                        new InlineQueryResultArticle(
                          duckduckgo_url,
                          duckduckgo_url,
                          "",
                          default_thumb_url
                        ),
                      ],
                      3600 // 1 hour
                    ))(
                    (results.Redirect !== "" && results.Redirect) ||
                      results.AbstractURL,
                    (results.Redirect === "" &&
                      `https://duckduckgo.com${(results.Image !== "" &&
                        results.Image) ||
                        (results.RelatedTopics.length !== 0 &&
                          results.RelatedTopics[0].Icon.URL !== "" &&
                          results.RelatedTopics[0].Icon.URL) ||
                        "/i/f96d4798.png"}`) ||
                      "",
                    "https://duckduckgo.com/i/f96d4798.png"
                  )
              )
          )) ??
        this.sendMessage(update.message.chat.id, duckduckgo_url))(
        (query === "" && "https://duckduckgo.com") ||
          addSearchParams(new URL("https://duckduckgo.com"), {
            q: query,
          }).href
      ))(args.slice(1).join(" "));

  // bot command: /kanye
  kanye = async (update): Promise<Response> =>
    console.log("entering kanye function") === undefined &&
    fetch("https://api.kanye.rest").then((response) =>
      response
        .json()
        .then(
          (json: { quote: string }) =>
            console.log("parsed json of response") === undefined &&
            ((message) =>
              (update.inline_query !== undefined &&
                this.answerInlineQuery(update.inline_query.id, [
                  new InlineQueryResultArticle(message),
                ])) ||
              this.sendMessage(update.message.chat.id, message))(
              `Kanye says... ${json.quote}`
            )
        )
    );

  // bot command: /joke
  joke = async (update) =>
    fetch("https://v2.jokeapi.dev/joke/Any?safe-mode")
      .then((response) => response.json())
      .then((joke: Joke) =>
        ((content) =>
          (update.inline_query &&
            this.answerInlineQuery(
              update.inline_query.id,
              [
                new InlineQueryResultArticle(
                  content,
                  joke.joke ?? joke.setup,
                  "HTML"
                ),
              ],
              0
            )) ??
          this.sendMessage(update.message.chat.id, content, "HTML"))(
          joke.joke ??
            `${joke.setup}\n\n<tg-spoiler>${joke.delivery}</tg-spoiler>`
        )
      );

  // bot command: /doge
  doge = async (update) =>
    fetch("https://shibe.online/api/shibes")
      .then((response) => response.json())
      .then(
        (json: [string]) =>
          (update.inline_query &&
            this.answerInlineQuery(
              update.inline_query.id,
              [new InlineQueryResultPhoto(json[0])],
              0
            )) ??
          this.sendPhoto(update.message.chat.id, json[0])
      );

  // bot command: /bored
  bored = async (update) =>
    fetch("https://boredapi.com/api/activity/")
      .then((response) => response.json())
      .then(
        (json: Bored) =>
          (update.inline_query &&
            this.answerInlineQuery(
              update.inline_query.id,
              [new InlineQueryResultArticle(json.activity)],
              0
            )) ??
          this.sendMessage(update.message.chat.id, json.activity)
      );

  // bot command: /epoch
  epoch = async (update) =>
    this.sendMessage(update.message.chat.id, new Date().getTime());

  // bot command: /balance
  balance = async (update, args) =>
    fetch(`https://blockchain.info/balance?active=${args[0]}`)
      .then((response) => response.json())
      .then((json: Balance) => (json[args[1]]?.final_balance ?? 0) / 100000000)
      .then((balance) => {
        const message = `${args[1]}\n\n${balance.toString()} BTC`;
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
    ((key) =>
      this.kv
        .get(key)
        .then(
          (value) =>
            (update.inline_query &&
              this.answerInlineQuery(
                update.inline_query.id,
                [new InlineQueryResultArticle(value)],
                0
              )) ??
            this.sendMessage(update.message.chat.id, value)
        ))(args[1]);

  // bot command: /set
  _set = async (update, args) =>
    this.kv.put &&
    ((key) =>
      ((value) =>
        this.kv
          .put(key, value)
          .then(
            (response) =>
              (response === undefined &&
                ((message) =>
                  (update.inline_query &&
                    this.answerInlineQuery(
                      update.inline_query.id,
                      [new InlineQueryResultArticle(message)],
                      0
                    )) ??
                  this.sendMessage(update.message.chat.id, message))(
                  `set ${key} to ${value}`
                )) ??
              new Response()
          ))(args.slice(2).join(" ")))(args[1]);

  _average = (numbers: number[]) =>
    parseFloat(
      (
        numbers.reduce((prev, cur) => prev + cur, 0) / numbers.length || 0
      ).toFixed(2)
    );

  // bot command: /average
  average = async (update) =>
    this.sendMessage(update.message.chat.id, this._average(this._numbers(100)));

  _numbers = (count = 100): number[] =>
    Array.from({ length: count ?? 100 }, () => Math.random()).map((x) =>
      parseFloat(x.toFixed(2))
    );

  // bot command: /numbers
  numbers = async (update, args) =>
    this.sendMessage(
      update.message.chat.id,
      preTagString(JSON.stringify(this._numbers(args[1]))),
      "HTML"
    );

  // bot command: /recursion
  recursion = async (update): Promise<Response> =>
    this.sendMessage(update.message.chat.id, "/recursion").then((response) => {
      return this.handler.postResponse(
        new Request("", { method: "POST", body: response.body }),
        this
      );
    });

  // bot command: /roll
  roll = async (update, args) =>
    ((outcome, message) =>
      (update.inline_query &&
        this.answerInlineQuery(update.inline_query.id, [
          new InlineQueryResultArticle(
            message(update.inline_query.from.username, outcome)
          ),
        ])) ??
      this.sendMessage(
        update.message.chat.id,
        message(update.message.from.username, outcome)
      ))(
      Math.floor(Math.random() * (args[1] ?? 6 - 1 + 1) + 1),
      (username, outcome) =>
        `@${username} rolled a ${args[1] ??
          6} sided die. it landed on ${outcome}`
    );

  // bot command: /commandList
  commandList = async (update) =>
    this.sendMessage(
      update.message.chat.id,
      `<pre>${JSON.stringify(Object.keys(this.commands))}</pre>`,
      "HTML"
    );

  // bot command: /toss
  toss = async (update) =>
    this.sendMessage(
      update.message.chat.id,
      Math.floor(Math.random() * 2) == 0 ? "heads" : "tails"
    );

  // bot command: /ping
  ping = async (update, args) =>
    this.sendMessage(
      update.message.chat.id,
      args.length === 1 ? "pong" : args.join(" ")
    );

  // bot command: /chatInfo
  getChatInfo = async (update) =>
    this.sendMessage(
      update.message.chat.id,
      preTagString(prettyJSON(update.message.chat)),
      "HTML"
    );

  // Send all the profile pictures to user_id
  sendAllProfilePhotos = async (chat_id, user_id) =>
    this.getUserProfilePhotos(user_id).then((result) =>
      result
        .json()
        .then(
          (content: { result: { photos: { file_id: string }[] } }) =>
            content.result.photos
        )
        .then((photos) =>
          photos.map((photo) => this.sendPhoto(chat_id, photo[0].file_id))
        )
    );
}
