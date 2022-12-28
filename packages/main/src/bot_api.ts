import Handler from "./handler";
import { Commands, Update, Webhook } from "./types";
import { Config } from "./handler";

export default class BotApi {
  commands: Commands;
  webhook: Config["webhook"];
  handler: Handler;
  update!: (update: Update) => Promise<Response>;

  constructor(commands: Commands, webhook: Webhook, handler: Handler) {
    this.commands = commands;
    this.webhook = webhook as Webhook;
    this.handler = handler;
  }
}