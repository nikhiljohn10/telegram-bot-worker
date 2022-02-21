import TelegramBot from "./telegram_bot";
import { JSONResponse, sha256, getBaseURL } from "./libs";
import { Config } from "./types";

export default class Handler {
  configs: Config[];

  constructor(configs) {
    this.configs = configs;
  }

  getResponse = async (request, bot): Promise<Response> =>
    (bot.token &&
      bot.webhook.process(new URL(request.url)).then((response) => {
        this.getAccessKeys().then((access_keys) =>
          Object.keys(access_keys).forEach((key) => {
            console.log(
              `${access_keys[key].bot_name} ${getBaseURL(request.url)}${key}`
            );
          })
        );
        return response;
      })) ??
    this.responses.default;

  postResponse = async (request, bot): Promise<Response> =>
    (bot.token &&
      request.json().then((content) => bot.update(request, content))) ??
    this.responses.default;

  responses = {
    GET: this.getResponse,
    POST: this.postResponse,
    default: JSONResponse({ error: "Invalid request" }, 400),
  };

  getAccessKeys = async (): Promise<
    Record<string, Record<string, string>> | Record<string, never>
  > =>
    Promise.all(
      this.configs.map((bot_config) =>
        sha256(bot_config.token).then((hash) => [hash, bot_config])
      )
    ).then((result) => Object.fromEntries(result));

  // handles the request
  handle = async (request: Request): Promise<Response> =>
    this.getAccessKeys().then(
      (access_keys) =>
        console.log({ access_keys }) === undefined &&
        this.responses[request.method](
          request,
          new TelegramBot({
            ...access_keys[
              new URL(request.url).pathname.substring(1).replace(/\/$/, "")
            ],
            url: getBaseURL(request.url), // worker url
            handler: this,
          })
        )
    ) ?? this.responses.default;
}
