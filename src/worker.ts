////////////////////////////////////////////////////////////////////
////           Telegram Bot using Cloudflare Worker             ////
////////////////////////////////////////////////////////////////////
////  Author: Nikhil John                                       ////
////  Repo: https://github.com/nikhiljohn10/telegram-bot-worker ////
////  License: MIT                                              ////
////                                                            ////
////  Author: Sean Behan                                        ////
////  Repo: https://github.com/codebam/mooniter                 ////
////  License: Apache-2.0                                       ////
////////////////////////////////////////////////////////////////////

import commands from "./commands";
import Handler from "./handler";

export default {
  fetch: async (request: Request, env) =>
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
          "/commands": commands.commandList,
          "/start": commands.commandList,
        },
        kv: env.KV_BOT_STORAGE,
      },
      {
        bot_name: "@duckduckbot",
        token: env.SECRET_TELEGRAM_API_TOKEN2,
        commands: {
          "": commands.duckduckgo, // default inline response
        },
      },
    ])
      .handle(request)
      .then((response) => {
        console.log({ response });
        response
          .clone()
          .text()
          .then((content) =>
            console.log({ result: { status: response.status, body: content } })
          );
        return response;
      }),
};
