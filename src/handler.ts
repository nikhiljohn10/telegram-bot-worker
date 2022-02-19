import TelegramBot from "./telegram_bot";
import { JSONResponse, sha256, getBaseURL } from "./libs";

export default class Handler {
  configs: any;
  tokens: [string];
  access_keys: string[];
  bot_id: number;
  request: Request;
  bot: TelegramBot;
  url: string;

  constructor(configs) {
    this.configs = configs;
    this.tokens = this.configs.map((item) => item.token);
  }

  // handles the request
  handle = async (request: any): Promise<Response> => {
    const url = new URL(request.url);
    const url_key = url.pathname.substring(1).replace(/\/$/, "");
    const worker_url = getBaseURL(request.url);
    console.log({ request });

    this.access_keys = await Promise.all(
      this.tokens.map(async (token) => await sha256(token))
    );
    for (const id in this.access_keys)
      console.log(
        this.configs[id].bot_name,
        "Access Link:",
        worker_url + this.access_keys[id]
      );

    this.bot_id = this.access_keys.indexOf(url_key);
    if (this.bot_id > -1) {
      return this.processRequest(request).then((req) => {
        this.bot = new TelegramBot({
          token: this.tokens[this.bot_id.toString()], // Bot Token
          access_key: this.access_keys[this.bot_id.toString()], // Access Key
          commands: this.configs[this.bot_id.toString()].commands, // Bot commands
          url: worker_url, // worker url
          kv: this.configs[this.bot_id.toString()].kv, // kv storage
        });
        if (req.method === "POST" && req.size > 6) {
          return this.bot.update(req);
        } else if (req.method === "GET") {
          this.bot.webhook.process(url);
          return this.bot.webhook.set();
        } else {
          return this.error(req.content.error);
        }
      });
    } else {
      return this.error("Invalid access key");
    }
  };

  processRequest = async (req): Promise<any> => {
    req.size = parseInt(req.headers["content-length"]) || 0;
    req.type = req.headers["content-type"] || "";
    if (req.cf) req.content = await this.getContent(req);
    else if (req.method == "GET")
      req.content = {
        message: "Accessing webhook",
      };
    else
      req.content = {
        message: "",
        error: "Invalid content type or body",
      };
    return req;
  };

  getContent = async (request) => {
    if (request.type.includes("application/json")) {
      return request.json;
    } else if (request.type.includes("text/")) {
      return request.text;
    } else if (request.type.includes("form")) {
      const formData = request.formData;
      const body = {};
      for (const entry of formData.entries()) {
        body[entry[0]] = entry[1];
      }
      return body;
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
