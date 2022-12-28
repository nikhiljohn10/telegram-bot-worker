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

import { telegram_commands, handler, telegram_webhook, telegram_bot } from "main";

interface Environment {
  SECRET_TELEGRAM_API_TOKEN: string;
  SECRET_TELEGRAM_API_TOKEN2: string;
  SECRET_TELEGRAM_API_TOKEN3: string;
  KV_BOT_STORAGE: KVNamespace;
}

export default {
  fetch: async (request: Request, env: Environment) =>
    new handler([
      {
        bot_name: "cf-workers-telegram-bot",
        api: telegram_bot,
        webhook: new telegram_webhook(new URL(`https://api.telegram.org/bot${env.SECRET_TELEGRAM_API_TOKEN}`), env.SECRET_TELEGRAM_API_TOKEN, new URL(new URL(request.url).origin)),
        commands: {
          "/ping": telegram_commands.ping,
          "/toss": telegram_commands.toss,
          "/epoch": telegram_commands.epoch,
          "/kanye": telegram_commands.kanye,
          "/bored": telegram_commands.bored,
          "/joke": telegram_commands.joke,
          "/dog": telegram_commands.dog,
          "/roll": telegram_commands.roll,
          "/get": telegram_commands._get,
          "/set": telegram_commands._set,
          "/duckduckgo": telegram_commands.duckduckgo,
          "/code": telegram_commands.code,
          "/commands": telegram_commands.commandList,
          "/help": telegram_commands.commandList,
          "/start": telegram_commands.commandList,
        },
        kv: env.KV_BOT_STORAGE,
      },
      {
        bot_name: "@duckduckbot",
        api: telegram_bot,
        webhook: new telegram_bot(new URL(`https://api.telegram.org/bot${env.SECRET_TELEGRAM_API_TOKEN2}`), env.SECRET_TELEGRAM_API_TOKEN2, new URL(new URL(request.url).origin)),
        commands: {
          inline: telegram_commands.duckduckgo, // default inline response
          "/duckduckgo": telegram_commands.duckduckgo,
          "/code": telegram_commands.code,
          "/commands": telegram_commands.commandList,
          "/start": telegram_commands.commandList,
        },
      },
      {
        bot_name: "@ddggbot",
        api: telegram_bot,
        webhook: new telegram_webhook(new URL(`https://api.telegram.org/bot${env.SECRET_TELEGRAM_API_TOKEN3}`), env.SECRET_TELEGRAM_API_TOKEN3, new URL(new URL(request.url).origin)),
        commands: {
          inline: telegram_commands.duckduckgo,
          "/duckduckgo": telegram_commands.duckduckgo,
          "/code": telegram_commands.code,
          "/commands": telegram_commands.commandList,
          "/start": telegram_commands.commandList,
        },
      },
    ]).handle(request),
};
