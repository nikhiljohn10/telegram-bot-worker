////////////////////////////////////////////////////////////////////
////           Telegram Bot using Cloudflare Worker             ////
////////////////////////////////////////////////////////////////////
////  Author: Nikhil John                                       ////
////  Repo: https://github.com/nikhiljohn10/telegram-bot-worker ////
////  License: MIT                                              ////
////                                                            ////
////  Author: Sean Behan                                        ////
////  Repo: https://github.com/codebam/cf-workers-telegram-bot  ////
////  License: Apache-2.0                                       ////
////////////////////////////////////////////////////////////////////

import commands from "./commands";
import Handler from "./handler";
import { responseToJSON } from "./libs";

interface Environment {
  SECRET_TELEGRAM_API_TOKEN: string;
  SECRET_TELEGRAM_API_TOKEN2: string;
  SECRET_TELEGRAM_API_TOKEN3: string;
  KV_BOT_STORAGE: KVNamespace;
}

export default {
  fetch: async (request: Request, env: Environment) =>
    new Handler([
      {
        bot_name: "cf-workers-telegram-bot",
        token: env.SECRET_TELEGRAM_API_TOKEN,
        commands: {
          "/chatinfo": commands.chatInfo,
          "/ping": commands.ping,
          "/toss": commands.toss,
          "/balance": commands.balance,
          "/epoch": commands.epoch,
          "/kanye": commands.kanye,
          "/bored": commands.bored,
          "/joke": commands.joke,
          "/doge": commands.doge,
          "/roll": commands.roll,
          "/recursion": commands.recursion,
          "/numbers": commands.numbers,
          "/average": commands.average,
          "/get": commands._get,
          "/set": commands._set,
          "/duckduckgo": commands.duckduckgo,
          "/code": commands.code,
          "/commands": commands.commandList,
          "/help": commands.commandList,
          "/start": commands.commandList,
        },
        kv: env.KV_BOT_STORAGE,
      },
      {
        bot_name: "@duckduckbot",
        token: env.SECRET_TELEGRAM_API_TOKEN2,
        commands: {
          inline: commands.duckduckgo, // default inline response
          "/duckduckgo": commands.duckduckgo,
          "/code": commands.code,
          "/commands": commands.commandList,
          "/start": commands.commandList,
        },
      },
      {
        bot_name: "@ddggbot",
        token: env.SECRET_TELEGRAM_API_TOKEN3,
        commands: {
          inline: commands.duckduckgo,
          "/duckduckgo": commands.duckduckgo,
          "/code": commands.code,
          "/commands": commands.commandList,
          "/start": commands.commandList,
        },
      },
    ]).handle(request),
};
