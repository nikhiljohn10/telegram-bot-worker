import TelegramBot from "./telegram_bot";
import { JSONResponse, sha256, getBaseURL } from "./libs";

export default class Handler {
  configs: any;

  constructor(configs) {
    this.configs = configs;
  }

  getResponse = async (request, bot): Promise<Response> =>
    (bot.token &&
      bot.webhook
        .process(new URL(request.url))
        .then((response) => {
          const access_keys = this.configs.reduce(
            (previous, bot_config) => ({
              ...previous,
              [sha256(bot_config.token).toString()]: bot_config,
            }),
            {}
          );
          Object.keys(access_keys).forEach((key) => {
            console.log(
              `${access_keys[key].bot_name} ${getBaseURL(request.url)}${key}`
            );
          });
          return response;
        })
        .then(() => bot.webhook.set())) ||
    this.responses.default();

  postResponse = async (request, bot): Promise<Response> =>
    (bot.token &&
      request.json().then((content) => bot.update(request, content))) ??
    this.responses.default();

  defaultResponse = (): Response => this.error("Invalid request");

  responses = {
    GET: this.getResponse,
    POST: this.postResponse,
    default: this.defaultResponse,
  };

  getAccessKeys = (): Map<string, Map<string, string>> =>
    this.configs.reduce(
      (previous, bot_config) => ({
        ...previous,
        [sha256(bot_config.token).toString()]: bot_config,
      }),
      {}
    );

  // handles the request
  handle = async (request: Request): Promise<Response> =>
    this.responses[request.method](
      request,
      new TelegramBot({
        ...this.getAccessKeys()[
          new URL(request.url).pathname.substring(1).replace(/\/$/, "")
        ],
        url: getBaseURL(request.url), // worker url
      })
    ) ?? this.responses.default();

  processRequest = (req): { message: string; error?: string } => {
    if (req.headers) return this.getContent(req);
    else if (req.method == "GET") {
      return {
        message: "Accessing webhook",
      };
    }
    return {
      message: "",
      error: "Invalid content type or body",
    };
  };

  getContent = (request) => {
    const _type = request.headers["content-type"] || "";
    if (_type.includes("application/json")) {
      return request.json;
    } else if (_type.includes("text/")) {
      return request.text;
    } else {
      return request.arrayBuffer;
    }
  };

  // handles error responses
  error = (message, status = 403): Response =>
    JSONResponse(
      {
        error: message,
      },
      status
    );
}
