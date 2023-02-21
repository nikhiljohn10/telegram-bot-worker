import Handler from "./handler";
import { Commands, Config, Update, Webhook } from "./types";

export default class BotApi {
	commands: Commands;
	webhook: Config["webhook"];
	handler: Handler;
	update!: (update: Update) => Promise<Response>;

	constructor(commands: Commands, webhook: Webhook, handler: Handler) {
		this.commands = commands;
		this.webhook = webhook;
		this.handler = handler;
	}
}
