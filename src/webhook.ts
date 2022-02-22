import { JSONResponse, sha256 } from "./libs";

export default class Webhook {
  api: URL;
  token: string;
  url: URL;

  constructor(api: URL, token: string, url: URL) {
    this.api = api;
    this.token = token;
    this.url = url;
  }

  // trigger getMe command of BotAPI
  getMe = () => this.execute(new URL(`${this.api}/getMe`));

  set = async (drop_pending_updates = true): Promise<Response> =>
    sha256(this.token)
      .then(
        (access_key) =>
          new URL(
            `${this.api}/setWebhook?url=${encodeURIComponent(
              `${this.url.href}/${access_key}`
            )}&max_connections=${100}&allowed_updates=${[
              "message",
            ]}&drop_pending_updates=${drop_pending_updates}`
          )
      )
      .then((url) => this.execute(url));

  get = async (): Promise<Response> =>
    this.execute(new URL(`${this.api}/getWebhookInfo`));

  delete = async (): Promise<Response> =>
    this.execute(new URL(`${this.api.href}/deleteWebhook`));

  execute = async (url: URL): Promise<Response> =>
    fetch(url.href).then((response) =>
      response.json().then((json) => JSONResponse(json))
    );

  webhookCommands = {
    setWebhook: this.set,
    getWebhook: this.get,
    delWebhook: this.delete,
    getMe: this.getMe,
    default: JSONResponse({ error: "Invalid command" }, 400),
  };

  process = async (url: URL): Promise<Response> =>
    this.webhookCommands[url.searchParams.get("command")]?.() ??
    this.webhookCommands.default;
}
