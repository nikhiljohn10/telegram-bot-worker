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

import commands from "./telegram_commands";
import Handler from "./handler";
import TelegramWebhook from "./telegram_webhook";

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
        webhook: new TelegramWebhook(new URL(`https://api.telegram.org/bot${env.SECRET_TELEGRAM_API_TOKEN}`), env.SECRET_TELEGRAM_API_TOKEN, new URL(new URL(request.url).origin)),
        commands: {
          "/ping": commands.ping,
          "/toss": commands.toss,
          "/epoch": commands.epoch,
          "/kanye": commands.kanye,
          "/bored": commands.bored,
          "/joke": commands.joke,
          "/dog": commands.dog,
          "/roll": commands.roll,
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
        webhook: new TelegramWebhook(new URL(`https://api.telegram.org/bot${env.SECRET_TELEGRAM_API_TOKEN2}`), env.SECRET_TELEGRAM_API_TOKEN2, new URL(new URL(request.url).origin)),
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
        webhook: new TelegramWebhook(new URL(`https://api.telegram.org/bot${env.SECRET_TELEGRAM_API_TOKEN3}`), env.SECRET_TELEGRAM_API_TOKEN3, new URL(new URL(request.url).origin)),
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
