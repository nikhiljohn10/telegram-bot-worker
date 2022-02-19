export default {
  chatInfo: async (bot, req, args) => bot.getChatInfo(req, args),
  ping: async (bot, req, args) => bot.ping(req, args),
  toss: async (bot, req, args) => bot.toss(req, args),
  balance: async (bot, req, args) => bot.balance(req, args),
  epoch: async (bot, req, args) => bot.epoch(req, args),
  kanye: async (bot, req, args) => bot.kanye(req, args),
  bored: async (bot, req, args) => bot.bored(req, args),
  joke: async (bot, req, args) => bot.joke(req, args),
  doge: async (bot, req, args) => bot.doge(req, args),
  roll: async (bot, req, args) => bot.roll(req, args),
  recursion: async (bot, req, args): Promise<Response> =>
    bot.recursion(req, args),
  numbers: async (bot, req, args) => bot.numbers(req, args),
  average: async (bot, req, args) => bot.average(req, args),
  _get: async (bot, req, args) => bot._get(req, args),
  _set: async (bot, req, args) => bot._set(req, args),
  commandList: async (bot, req, args) => bot.commandList(req, args),
};
