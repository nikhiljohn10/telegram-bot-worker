import {
	TelegramCommands,
	Handler,
	TelegramWebhook,
	TelegramBot,
} from "../../main/src/main";
import { Command } from "../../main/src/types";

interface Environment {
	SECRET_TELEGRAM_API_TOKEN: string;
	KV_GET_SET: KVNamespace;
	KV_UID_DATA: KVNamespace;

	SECRET_TELEGRAM_API_TOKEN2: string;

	SECRET_TELEGRAM_API_TOKEN3: string;
}

export default {
	fetch: async (request: Request, env: Environment) =>
		new Handler([
			{
				bot_name: "cf-workers-telegram-bot",
				api: TelegramBot,
				webhook: new TelegramWebhook(
					new URL(
						`https://api.telegram.org/bot${env.SECRET_TELEGRAM_API_TOKEN}`
					),
					env.SECRET_TELEGRAM_API_TOKEN,
					new URL(new URL(request.url).origin)
				),
				commands: {
					"/ping": TelegramCommands.ping as Command,
					"/toss": TelegramCommands.toss as Command,
					"/epoch": TelegramCommands.epoch as Command,
					"/kanye": TelegramCommands.kanye as Command,
					"/bored": TelegramCommands.bored as Command,
					"/joke": TelegramCommands.joke as Command,
					"/dog": TelegramCommands.dog as Command,
					"/cat": TelegramCommands.cat as Command,
					"/roll": TelegramCommands.roll as Command,
					"/get": TelegramCommands._get as Command,
					"/set": TelegramCommands._set as Command,
					"/duckduckgo": TelegramCommands.duckduckgo as Command,
					"/code": TelegramCommands.code as Command,
					"/commands": TelegramCommands.commandList as Command,
					"/help": TelegramCommands.commandList as Command,
					"/start": TelegramCommands.commandList as Command,
				},
				kv: { get_set: env.KV_GET_SET, uid_data: env.KV_UID_DATA },
			},
			{
				bot_name: "@duckduckbot",
				api: TelegramBot,
				webhook: new TelegramWebhook(
					new URL(
						`https://api.telegram.org/bot${env.SECRET_TELEGRAM_API_TOKEN2}`
					),
					env.SECRET_TELEGRAM_API_TOKEN2,
					new URL(new URL(request.url).origin)
				),
				commands: {
					inline: TelegramCommands.duckduckgo as Command, // default inline response
					"/duckduckgo": TelegramCommands.duckduckgo as Command,
					"/code": TelegramCommands.code as Command,
					"/commands": TelegramCommands.commandList as Command,
					"/help": TelegramCommands.commandList as Command,
					"/start": TelegramCommands.commandList as Command,
				},
			},
			{
				bot_name: "@ddggbot",
				api: TelegramBot,
				webhook: new TelegramWebhook(
					new URL(
						`https://api.telegram.org/bot${env.SECRET_TELEGRAM_API_TOKEN3}`
					),
					env.SECRET_TELEGRAM_API_TOKEN3,
					new URL(new URL(request.url).origin)
				),
				commands: {
					inline: TelegramCommands.duckduckgo as Command,
					"/duckduckgo": TelegramCommands.duckduckgo as Command,
					"/code": TelegramCommands.code as Command,
					"/commands": TelegramCommands.commandList as Command,
					"/help": TelegramCommands.commandList as Command,
					"/start": TelegramCommands.commandList as Command,
				},
			},
		]).handle(request).then(() => new Response()),
};
