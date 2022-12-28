import BotApi from "./bot_api";
import Commands from "./commands";
import { sha256, log } from "./libs";
import { Command, PartialConfig, Update, Webhook } from "./types";

export class Config {
  bot_name: string;
  api: object;
  webhook: Webhook;
  commands: Record<string, Command>;
  kv: KVNamespace | undefined;
  url: URL;
  handler: Handler | undefined;
  constructor(config: PartialConfig = {}) {
    this.bot_name = config.bot_name || "";
    this.api = config.api || {};
    this.webhook = config.webhook || new Webhook(new URL(''), '', new URL(''));
    this.commands = config.commands || {};
    this.kv = config.kv;
    this.url = config.url || new URL('');
    this.handler = config.handler;
  }
}

export default class Handler {
  configs: PartialConfig[];

  constructor(configs: PartialConfig[]) {
    this.configs = configs;
  }

  getResponse = async (_request?: Request, _bot?: BotApi): Promise<Response> => {
    this.getAccessKeys().then((access_keys) => Object.keys(access_keys).forEach((key) => log(
      `${access_keys[key].bot_name} ${new URL(_request?.url ?? '').origin}/${key}`
    )));
    if (_bot?.webhook.token) {
      return _bot.webhook.process(new URL(_request?.url ?? ''));
    }
    return this.responses.default();
  }

  postResponse = async (_request?: Request, _bot?: BotApi): Promise<Response> => {
    const bot = _bot ?? new BotApi(new Commands(), new Webhook(new URL(''), '', new URL('')), new Handler([new Config()]))
    if (bot.webhook.token) {
      const request = _request ?? new Request('');
      return request
        .json()
        .then((update: unknown) => bot.update(update as Update));
    }
    return this.responses.default();
  }

  responses: Record<string, (_request?: Request, _bot?: BotApi) => Promise<Response>> = {
    GET: this.getResponse,
    POST: this.postResponse,
    default: (_request?: Request, _bot?: BotApi) => new Promise(() => new Response()),
  };

  getAccessKeys = async (): Promise<
    Record<string, any> | Record<string, never>
  > =>
    Promise.all(
      this.configs.map((bot_config) =>
        sha256(bot_config.webhook?.token ?? '').then((hash) => [hash, bot_config])
      )
    ).then((result) => Object.fromEntries(result));

  // handles the request
  handle = async (request: Request): Promise<Response> => this.getAccessKeys().then((access_keys) => {
    if (Object.keys(this.responses).includes(request.method)) {
      return this.responses[request.method](
        request,
        new access_keys[new URL(request.url).pathname.substring(1)].api({
          ...new Config(),
          url: new URL(new URL(request.url).origin), // worker url
          handler: this,
          ...access_keys[new URL(request.url).pathname.substring(1)],
        })
      )
    }
    return this.responses.default();
  });
}
