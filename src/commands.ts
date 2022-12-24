import { TelegramUpdate } from "./types";
import TelegramBot from "./telegram_bot";

export default {
  chatInfo: async (bot: TelegramBot, update: TelegramUpdate) =>
    bot.getChatInfo(update),
  ping: async (bot: TelegramBot, update: TelegramUpdate, args: string[]) =>
    bot.ping(update, args),
  toss: async (bot: TelegramBot, update: TelegramUpdate) =>
    bot.toss(update),
  balance: async (bot: TelegramBot, update: TelegramUpdate, args: string[]) =>
    bot.balance(update, args),
  epoch: async (bot: TelegramBot, update: TelegramUpdate) =>
    bot.epoch(update),
  kanye: async (bot: TelegramBot, update: TelegramUpdate) =>
    bot.kanye(update),
  bored: async (bot: TelegramBot, update: TelegramUpdate) =>
    bot.bored(update),
  joke: async (bot: TelegramBot, update: TelegramUpdate) =>
    bot.joke(update),
  doge: async (bot: TelegramBot, update: TelegramUpdate) =>
    bot.doge(update),
  roll: async (bot: TelegramBot, update: TelegramUpdate) =>
    bot.roll(update, args),
  recursion: async (bot: TelegramBot, update: TelegramUpdate) =>
    bot.recursion(update),
  numbers: async (bot: TelegramBot, update: TelegramUpdate, args: string[]) =>
    bot.numbers(update, args),
  average: async (bot: TelegramBot, update: TelegramUpdate) =>
    bot.average(update),
  _get: async (bot: TelegramBot, update: TelegramUpdate, args: string[]) =>
    bot._get(update, args),
  _set: async (bot: TelegramBot, update: TelegramUpdate, args: string[]) =>
    bot._set(update, args),
  duckduckgo: async (
    bot: TelegramBot,
    update: TelegramUpdate,
    args: string[]
  ) => bot.duckduckgo(update, args),
  code: async (bot: TelegramBot, update: TelegramUpdate) =>
    bot.code(update),
  commandList: async (bot: TelegramBot, update: TelegramUpdate) =>
    bot.commandList(update),
};
