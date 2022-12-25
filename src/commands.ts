import { TelegramUpdate } from "./types";
import TelegramBot from "./telegram_bot";

export default {
  chatInfo: async (bot: TelegramBot, update: TelegramUpdate, args: string[]) =>
    bot.getChatInfo(update),
  ping: async (bot: TelegramBot, update: TelegramUpdate, args: string[]) =>
    bot.ping(update, args),
  toss: async (bot: TelegramBot, update: TelegramUpdate, args: string[]) =>
    bot.toss(update),
  epoch: async (bot: TelegramBot, update: TelegramUpdate, args: string[]) =>
    bot.epoch(update),
  kanye: async (bot: TelegramBot, update: TelegramUpdate, args: string[]) =>
    bot.kanye(update),
  bored: async (bot: TelegramBot, update: TelegramUpdate, args: string[]) =>
    bot.bored(update),
  joke: async (bot: TelegramBot, update: TelegramUpdate, args: string[]) =>
    bot.joke(update),
  doge: async (bot: TelegramBot, update: TelegramUpdate, args: string[]) =>
    bot.doge(update),
  roll: async (bot: TelegramBot, update: TelegramUpdate, args: string[]) =>
    bot.roll(update, args),
  _get: async (bot: TelegramBot, update: TelegramUpdate, args: string[]) =>
    bot._get(update, args),
  _set: async (bot: TelegramBot, update: TelegramUpdate, args: string[]) =>
    bot._set(update, args),
  duckduckgo: async (
    bot: TelegramBot,
    update: TelegramUpdate,
    args: string[]
  ) => bot.duckduckgo(update, args),
  code: async (bot: TelegramBot, update: TelegramUpdate, args: string[]) =>
    bot.code(update),
  commandList: async (
    bot: TelegramBot,
    update: TelegramUpdate,
    args: string[]
  ) => bot.commandList(update),
};
