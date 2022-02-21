import { JSONResponse, sha256 } from "./libs";

export default class Webhook {
  api: string;
  token: string;
  url: string;

  constructor(api, token, url) {
    this.api = api;
    this.token = token;
    this.url = url;
  }

  // trigger getMe command of BotAPI
  getMe = () => this.execute(`${this.api}/getMe`);

  set = async (drop_pending_updates = true) =>
    sha256(this.token)
      .then(
        (access_key) =>
          `${this.api}/setWebhook?url=${encodeURIComponent(
            `${this.url}${access_key}`
          )}&max_connections=${100}&allowed_updates=${[
            "message",
          ]}&drop_pending_updates=${drop_pending_updates}`
      )
      .then((url) => this.execute(url));

  get = async () => this.execute(`${this.api}/getWebhookInfo`);

  delete = async () => this.execute(`${this.api}/deleteWebhook`);

  execute = async (url) =>
    fetch(url)
      .then((response) => response.json())
      .then((json) => JSONResponse(json));

  webhookCommands = {
    setWebhook: this.set,
    getWebhook: this.get,
    delWebhook: this.delete,
    getMe: this.getMe,
    default: JSONResponse({ error: "Invalid command" }, 400),
  };

  process = async (url) =>
    this.webhookCommands[url.searchParams.get("command")]?.() ??
    this.webhookCommands.default;
}
