import TelegramBot from "./telegram_bot";
import { sha256, log } from "./libs";
import { Config, PartialConfig, TelegramUpdate } from "./types";
import Bot from "./bot";

export default class Handler {
  configs: PartialConfig[];

  constructor(configs: PartialConfig[]) {
    this.configs = configs;
  }

  getResponse = async (request: Request, bot: Bot): Promise<Response> =>
    (this.getAccessKeys().then((access_keys) =>
      Object.keys(access_keys).forEach((key) =>
        log(
          `${access_keys[key].bot_name} ${new URL(request.url).origin}/${key}`
        )
      )
    ) &&
      bot.token &&
      bot.webhook.process(new URL(request.url))) ??
    this.responses.default;

  postResponse = async (request: Request, bot: Bot): Promise<Response> =>
    (bot.token &&
      request
        .json()
        .then((update) => bot.update(new TelegramUpdate(update)))) ??
    this.responses.default;

  responses = {
    GET: this.getResponse,
    POST: this.postResponse,
    default: new Response(),
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
    this.getAccessKeys().then((access_keys) =>
      this.responses[request.method](
        request,
        new TelegramBot({
          ...new Config(),
          url: new URL(new URL(request.url).origin), // worker url
          handler: this,
          ...access_keys[new URL(request.url).pathname.substring(1)],
        })
      )
    ) ?? this.responses.default;
}
