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
  fetch: async (request: Request, env, context) =>
    new Handler([
      {
        bot_name: "CCMooniterBot",
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
          "/commandlist": commands.commandList,
        },
        kv: env.KV_BOT_STORAGE,
      },
    ]).handle({
      url: request.url,
      method: request.method,
      headers: {
        "cf-connecting-ip": request.headers.get("cf-connecting-ip"),
        "content-length": request.headers.get("content-length"),
        "content-type": request.headers.get("content-type"),
      },
      cf: request.cf,
      json: request.json(),
      text: request.text(),
      formData: request.formData(),
      arrayBuffer: request.arrayBuffer(),
    }),
};
