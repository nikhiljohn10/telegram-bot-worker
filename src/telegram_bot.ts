import Bot from "./bot";
import {
  preTagString,
  prettyJSON,
  addSearchParams,
  responseToJSON,
} from "./libs";
import {
  Joke,
  Bored,
  TelegramInlineQueryResultArticle,
  TelegramInlineQueryResultPhoto,
  TelegramUpdate,
  Config,
  DDGQueryResponse,
} from "./types";

export default class TelegramBot extends Bot {
  constructor(config: Config) {
    super(config);
  }

  // bot command: /code
  code = async (update: TelegramUpdate): Promise<Response> =>
    ((url) =>
      (update.inline_query &&
        this.answerInlineQuery(update.inline_query.id, [
          new TelegramInlineQueryResultArticle(url),
        ])) ??
      this.sendMessage(update.message.chat.id, url))(
      "https://github.com/codebam/cf-workers-telegram-bot"
    );

  // bot command: /duckduckgo
  duckduckgo = async (
    update: TelegramUpdate,
    args: string[]
  ): Promise<Response> =>
    ((query) =>
      ((duckduckgo_url) =>
        (update.inline_query &&
          query === "" &&
          this.answerInlineQuery(update.inline_query.id, [
            new TelegramInlineQueryResultArticle("https://duckduckgo.com"),
          ])) ||
        (update.inline_query &&
          fetch(
            addSearchParams(new URL("https://api.duckduckgo.com"), {
              q: query,
              format: "json",
              t: "telegram_bot",
              no_redirect: "1",
            }).href
          ).then((response) =>
            response.json().then((results: DDGQueryResponse) =>
              ((
                instant_answer_url,
                thumb_url,
                default_thumb_url = "https://duckduckgo.com/assets/icons/meta/DDG-icon_256x256.png"
              ) =>
                this.answerInlineQuery(
                  update.inline_query.id,
                  (instant_answer_url !== "" && [
                    new TelegramInlineQueryResultArticle(
                      `${instant_answer_url}\n\n<a href="${
                        addSearchParams(new URL(duckduckgo_url), {
                          q: args
                            .slice(1)
                            .join(" ")
                            .replace(/^!\w* /, ""),
                        }).href
                      }">Results From DuckDuckGo</a>`,
                      instant_answer_url,
                      "HTML",
                      thumb_url
                    ),
                    new TelegramInlineQueryResultArticle(
                      duckduckgo_url,
                      duckduckgo_url,
                      "",
                      default_thumb_url
                    ),
                  ]) || [
                    new TelegramInlineQueryResultArticle(
                      duckduckgo_url,
                      duckduckgo_url,
                      "",
                      default_thumb_url
                    ),
                  ],
                  3600 // 1 hour
                ))(
                results.Redirect || results.AbstractURL,
                (results.Redirect === "" &&
                  `https://duckduckgo.com${
                    (results.Image !== "" && results.Image) ||
                    (results.RelatedTopics.length !== 0 &&
                      results.RelatedTopics[0].Icon.URL !== "" &&
                      results.RelatedTopics[0].Icon.URL) ||
                    "/i/f96d4798.png"
                  }`) ||
                  ""
              )
            )
          )) ||
        this.sendMessage(update.message.chat.id, duckduckgo_url))(
        (query === "" && "https://duckduckgo.com") ||
          addSearchParams(new URL("https://duckduckgo.com"), {
            q: query,
          }).href
      ))(args.slice(1).join(" "));

  // bot command: /kanye
  kanye = async (update: TelegramUpdate): Promise<Response> =>
    fetch("https://api.kanye.rest")
      .then((response) => responseToJSON(response))
      .then((json: { quote: string }) =>
        ((message) =>
          (update.inline_query !== undefined &&
            this.answerInlineQuery(update.inline_query.id, [
              new TelegramInlineQueryResultArticle(message),
            ])) ||
          this.sendMessage(update.message.chat.id, message))(
          `Kanye says... ${json.quote}`
        )
      )
      .catch(() => new Response("Failed to parse JSON"));

  // bot command: /joke
  joke = async (update: TelegramUpdate): Promise<Response> =>
    fetch("https://v2.jokeapi.dev/joke/Any?safe-mode")
      .then((response) => responseToJSON(response))
      .then((joke: Joke) =>
        ((message) =>
          (update.inline_query &&
            this.answerInlineQuery(
              update.inline_query.id,
              [
                new TelegramInlineQueryResultArticle(
                  message,
                  joke.joke ?? joke.setup,
                  "HTML"
                ),
              ],
              0
            )) ??
          this.sendMessage(update.message.chat.id, message, "HTML"))(
          joke.joke ??
            `${joke.setup}\n\n<tg-spoiler>${joke.delivery}</tg-spoiler>`
        )
      );

  // bot command: /dog
  dog = async (update: TelegramUpdate): Promise<Response> =>
    fetch("https://shibe.online/api/shibes")
      .then((response) => response.json())
      .then(
        (json: [string]) =>
          (update.inline_query &&
            this.answerInlineQuery(
              update.inline_query.id,
              [new TelegramInlineQueryResultPhoto(json[0])],
              0
            )) ??
          this.sendPhoto(update.message.chat.id, json[0])
      );

  // bot command: /bored
  bored = async (update: TelegramUpdate): Promise<Response> =>
    fetch("https://boredapi.com/api/activity/")
      .then((response) => responseToJSON(response))
      .then(
        (json: Bored) =>
          (update.inline_query &&
            this.answerInlineQuery(
              update.inline_query.id,
              [new TelegramInlineQueryResultArticle(json.activity)],
              0
            )) ??
          this.sendMessage(update.message.chat.id, json.activity)
      );

  // bot command: /epoch
  epoch = async (update: TelegramUpdate): Promise<Response> =>
    ((seconds) =>
      (update.inline_query &&
        this.answerInlineQuery(
          update.inline_query.id,
          [new TelegramInlineQueryResultArticle(seconds)],
          0
        )) ??
      this.sendMessage(update.message.chat.id, seconds))(
      Math.floor(Date.now() / 1000).toString()
    );

  // bot command: /get
  _get = async (update: TelegramUpdate, args: string[]): Promise<Response> =>
    this.kv.get &&
    ((key) =>
      this.kv
        .get(key)
        .then(
          (value) =>
            (update.inline_query &&
              this.answerInlineQuery(
                update.inline_query.id,
                [new TelegramInlineQueryResultArticle(value)],
                0
              )) ??
            this.sendMessage(update.message.chat.id, value)
        ))(args[1]);

  // bot command: /set
  _set = async (update: TelegramUpdate, args: string[]): Promise<Response> =>
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
                      [new TelegramInlineQueryResultArticle(message)],
                      0
                    )) ??
                  this.sendMessage(update.message.chat.id, message))(
                  `set ${key} to ${value}`
                )) ??
              new Response()
          ))(args.slice(2).join(" ")))(args[1]);

  _average = (numbers: number[]): number =>
    parseFloat(
      (
        numbers.reduce((prev, cur) => prev + cur, 0) / numbers.length || 0
      ).toFixed(2)
    );

  // bot command: /recursion
  recursion = async (update: TelegramUpdate): Promise<Response> =>
    this.sendMessage(update.message.chat.id, "/recursion");
  // .then((response) => responseToJSON(response))
  // .then((result: { ok: boolean; result: { text: string } }) =>
  //   this.handler.postResponse(
  //     new Request("", {
  //       method: "POST",
  //       body: JSON.stringify({
  //         message: {
  //           text: result.result.text,
  //           chat: { id: update.message.chat.id },
  //         },
  //       }),
  //     }),
  //     this
  //   )
  // );

  // bot command: /roll
  roll = async (update: TelegramUpdate, args: string[]): Promise<Response> =>
    ((outcome, message) =>
      (update.inline_query &&
        this.answerInlineQuery(update.inline_query.id, [
          new TelegramInlineQueryResultArticle(
            message(
              update.inline_query.from.username,
              update.inline_query.from.first_name,
              outcome
            )
          ),
        ])) ??
      this.sendMessage(
        update.message.chat.id,
        message(
          update.message.from.username,
          update.message.from.first_name,
          outcome
        )
      ))(
      Math.floor(Math.random() * (parseInt(args[1]) || 6 - 1 + 1) + 1),
      (username: string, first_name: string, outcome: number) =>
        `${username ?? first_name} rolled a ${
          parseInt(args[1]) || 6
        } sided die. it landed on ${outcome}`
    );

  // bot command: /commandList
  commandList = async (update: TelegramUpdate): Promise<Response> =>
    this.sendMessage(
      update.message.chat.id,
      `<pre>${JSON.stringify(Object.keys(this.commands))}</pre>`,
      "HTML"
    );

  // bot command: /toss
  toss = async (update: TelegramUpdate): Promise<Response> =>
    this.sendMessage(
      update.message.chat.id,
      Math.floor(Math.random() * 2) == 0 ? "heads" : "tails"
    );

  // bot command: /ping
  ping = async (update: TelegramUpdate, args: string[]): Promise<Response> =>
    this.sendMessage(
      update.message.chat.id,
      args.length === 1 ? "pong" : args.slice(1).join(" ")
    );

  // bot command: /chatInfo
  getChatInfo = async (update: TelegramUpdate): Promise<Response> =>
    this.sendMessage(
      update.message.chat.id,
      preTagString(prettyJSON(update.message.chat)),
      "HTML"
    );
}
