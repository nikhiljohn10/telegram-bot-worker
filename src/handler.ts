import TelegramBot from "./telegram_bot";
import { JSONResponse, sha256, getBaseURL } from "./libs";

export default class Handler {
  configs: any;
  access_keys: string[];
  bot_id: number;
  request: Request;
  bot: TelegramBot;
  url: string;

  constructor(configs) {
    this.configs = configs;
  }

  // handles the request
  handle = async (request: Request): Promise<Response> => {
    console.log({ request });
    console.log({ json: request.json() });
    const url = new URL(request.url);
    const url_key = url.pathname.substring(1).replace(/\/$/, "");
    const worker_url = getBaseURL(request.url);
    const access_keys = this.configs.reduce(
      (previous, bot_config) => ({
        ...previous,
        [sha256(bot_config.token).toString()]: bot_config,
      }),
      {}
    );
    Object.keys(access_keys).forEach((key) => {
      console.log(`${access_keys[key].bot_name} ${worker_url}${key}`);
    });
    if (access_keys[url_key]) {
      const content = this.processRequest(request);
      console.log({ content });
      this.bot = new TelegramBot({
        token: access_keys[url_key].token, // Bot Token
        commands: access_keys[url_key].commands, // Bot commands
        url: worker_url, // worker url
        kv: access_keys[url_key].kv, // kv storage
      });
      if (
        request.method === "POST" &&
        (request.headers["content-length"] || 0) > 6
      ) {
        return this.bot.update(content);
      } else if (request.method === "GET") {
        this.bot.webhook.process(url);
        return this.bot.webhook.set();
      } else {
        return this.error(content.error);
      }
    } else {
      return this.error("Invalid access key");
    }
  };

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
      console.log({ request_json: request.json });
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
