import TelegramBot from "./telegram_bot";
import { TelegramUpdate } from "./types";

export default class TelegramCommands {
	static ping = async (
		bot: TelegramBot,
		update: TelegramUpdate,
		args: string[]
	) => bot.ping(update, args);
	static toss = async (bot: TelegramBot, update: TelegramUpdate) =>
		bot.toss(update);
	static epoch = async (bot: TelegramBot, update: TelegramUpdate) =>
		bot.epoch(update);
	static kanye = async (bot: TelegramBot, update: TelegramUpdate) =>
		bot.kanye(update);
	static bored = async (bot: TelegramBot, update: TelegramUpdate) =>
		bot.bored(update);
	static joke = async (bot: TelegramBot, update: TelegramUpdate) =>
		bot.joke(update);
	static dog = async (bot: TelegramBot, update: TelegramUpdate) =>
		bot.dog(update);
	static cat = async (bot: TelegramBot, update: TelegramUpdate) =>
		bot.cat(update);
	static roll = async (
		bot: TelegramBot,
		update: TelegramUpdate,
		args: string[]
	) => bot.roll(update, args);
	static _get = async (
		bot: TelegramBot,
		update: TelegramUpdate,
		args: string[]
	) => bot._get(update, args);
	static _set = async (
		bot: TelegramBot,
		update: TelegramUpdate,
		args: string[]
	) => bot._set(update, args);
	static duckduckgo = async (
		bot: TelegramBot,
		update: TelegramUpdate,
		args: string[]
	) => bot.duckduckgo(update, args);
	static code = async (bot: TelegramBot, update: TelegramUpdate) =>
		bot.code(update);
	static commandList = async (bot: TelegramBot, update: TelegramUpdate) =>
		bot.commandList(update);
}
