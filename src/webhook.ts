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
  getMe = () => this.execute(this.api + "/getMe");

  set = async () => {
    const access_key = await sha256(this.token);
    const max_connections = 100;
    const allowed_updates = ["message"];
    return this.execute(
      this.api +
        `/setWebhook?url=${encodeURIComponent(
          this.url + access_key
        )}&max_connections=${max_connections}&allowed_updates=${allowed_updates}`
    );
  };

  get = async () => this.execute(this.api + "/getWebhookInfo");

  delete = async () => this.execute(this.api + "/deleteWebhook");

  execute = async (url) =>
    fetch(url)
      .then((response) => response.json())
      .then((json) => JSONResponse(json));

  process = async (url) => {
    const command = url.searchParams.get("command");
    if (command == undefined) {
      return this.error("No command found", 404);
    }
    // handles the url commands
    switch (command) {
      case "setWebhook":
        return await this.set();
      case "getWebhook":
        return await this.get();
      case "delWebhook":
        return await this.delete();
      case "getMe":
        return await this.getMe();
      case "":
        return this.error("No command found", 404);
      default:
        return this.error("Invalid command", 400);
    }
  };

  // handles error responses
  error = (message, status = 403) =>
    JSONResponse(
      {
        error: message,
      },
      status
    );
}
