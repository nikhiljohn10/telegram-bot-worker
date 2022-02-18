import Webhook from "./webhook";
import { InlineQueryResultArticle, addURLOptions } from "./libs";
import hasOwn from "core-js-pure/es/object/has-own";

export default class Bot {
  token: string;
  commands: any;
  api: string;
  webhook: Webhook;

  constructor(config) {
    this.token = config.token;
    this.commands = config.commands;
    this.api = "https://api.telegram.org/bot" + config.token;
    this.webhook = new Webhook(this.api, config.token, config.url);
  }

  async update(request) {
    console.log(request.content);
    if (hasOwn(request.content, "inline_query")) {
      if (!(await this.executeInlineCommand(request))) {
        // don't send messages on invalid commands
      }
    } else if (hasOwn(request.content, "message")) {
      if (hasOwn(request.content, "text")) {
        // Test command and execute
        if (!(await this.executeCommand(request))) {
          // don't send messages on invalid commands
        }
      } else if (hasOwn(request.content, "photo")) {
        // process photo
      } else if (hasOwn(request.content, "video")) {
        // process video
      } else if (hasOwn(request.content, "animation")) {
        // process animation
      } else if (hasOwn(request.content, "location")) {
        // process locaiton
      } else if (hasOwn(request.content, "poll")) {
        // process poll
      } else if (hasOwn(request.content, "contact")) {
        // process contact
      } else if (hasOwn(request.content, "dice")) {
        // process dice
      } else if (hasOwn(request.content, "sticker")) {
        // process sticker
      } else if (hasOwn(request.content, "reply_to_message")) {
        // process reply of a message
      }
    } else {
      // process unknown type
    }

    // return 200 OK response to every update request
    return new Response("True", {
      status: 200,
    });
  }

  // execute the inline custom bot commands from bot configurations
  async executeInlineCommand(request) {
    const inlinecmdArray = request.content.inline_query.query.split(" ");
    const inline_command = inlinecmdArray.shift();
    const isinlineCommand = Object.keys(this.commands).includes(inline_command);
    if (isinlineCommand) {
      await this.commands[inline_command](this, request, inlinecmdArray);
      return true;
    }
    return false;
  }

  // execute the custom bot commands from bot configurations
  async executeCommand(request) {
    const cmdArray = request.content.message.text.split(" ");
    const command = cmdArray.shift();
    const isCommand = Object.keys(this.commands).includes(command);
    if (isCommand) {
      await this.commands[command](this, request, cmdArray);
      return true;
    }
    return false;
  }

  // trigger answerInlineQuery command of BotAPI
  answerInlineQuery = async (inline_query_id, results, cache_time = 0) =>
    fetch(
      `${
        this.api
      }/answerInlineQuery?inline_query_id=${inline_query_id}&results=${encodeURIComponent(
        JSON.stringify([InlineQueryResultArticle(results)])
      )}&cache_time=${cache_time}`
    );

  // trigger sendMessage command of BotAPI
  sendMessage = async (
    chat_id,
    text,
    parse_mode = "",
    disable_web_page_preview = false,
    disable_notification = false,
    reply_to_message_id = 0
  ) => {
    let url = `${this.api}/sendMessage?chat_id=${chat_id}&text=${text}`;

    url = addURLOptions(url, {
      parse_mode: parse_mode,
      disable_web_page_preview: disable_web_page_preview,
      disable_notification: disable_notification,
      reply_to_message_id: reply_to_message_id,
    });

    return fetch(url);
  };

  // trigger forwardMessage command of BotAPI
  async forwardMessage(
    chat_id,
    from_chat_id,
    disable_notification = false,
    message_id
  ) {
    let url =
      this.api +
      "/sendMessage?chat_id=" +
      chat_id +
      "&from_chat_id=" +
      from_chat_id +
      "&message_id=" +
      message_id;
    if (disable_notification)
      url += "&disable_notification=" + disable_notification;

    url = addURLOptions(url, {
      disable_notification: disable_notification,
    });

    await fetch(url);
  }

  // trigger sendPhoto command of BotAPI
  async sendPhoto(
    chat_id,
    photo,
    caption = "",
    parse_mode = "",
    disable_notification = false,
    reply_to_message_id = 0
  ) {
    let url = this.api + "/sendPhoto?chat_id=" + chat_id + "&photo=" + photo;

    url = addURLOptions(url, {
      caption: caption,
      parse_mode: parse_mode,
      disable_notification: disable_notification,
      reply_to_message_id: reply_to_message_id,
    });

    await fetch(url);
  }

  // trigger sendVideo command of BotAPI
  async sendVideo(
    chat_id,
    video,
    duration = 0,
    width = 0,
    height = 0,
    thumb = "",
    caption = "",
    parse_mode = "",
    supports_streaming = false,
    disable_notification = false,
    reply_to_message_id = 0
  ) {
    let url = this.api + "/sendVideo?chat_id=" + chat_id + "&video=" + video;

    url = addURLOptions(url, {
      duration: duration,
      width: width,
      height: height,
      thumb: thumb,
      caption: caption,
      parse_mode: parse_mode,
      supports_streaming: supports_streaming,
      disable_notification: disable_notification,
      reply_to_message_id: reply_to_message_id,
    });

    await fetch(url);
  }

  // trigger sendAnimation command of BotAPI
  async sendAnimation(
    chat_id,
    animation,
    duration = 0,
    width = 0,
    height = 0,
    thumb = "",
    caption = "",
    parse_mode = "",
    disable_notification = false,
    reply_to_message_id = 0
  ) {
    let url =
      this.api +
      "/sendAnimation?chat_id=" +
      chat_id +
      "&animation=" +
      animation;

    url = addURLOptions(url, {
      duration: duration,
      width: width,
      height: height,
      thumb: thumb,
      caption: caption,
      parse_mode: parse_mode,
      disable_notification: disable_notification,
      reply_to_message_id: reply_to_message_id,
    });

    await fetch(url);
  }

  // trigger sendLocation command of BotAPI
  async sendLocation(
    chat_id,
    latitude,
    longitude,
    live_period = 0,
    disable_notification = false,
    reply_to_message_id = 0
  ) {
    let url =
      this.api +
      "/sendLocation?chat_id=" +
      chat_id +
      "&latitude=" +
      latitude +
      "&longitude=" +
      longitude;

    url = addURLOptions(url, {
      live_period: live_period,
      disable_notification: disable_notification,
      reply_to_message_id: reply_to_message_id,
    });

    await fetch(url);
  }

  // trigger senPoll command of BotAPI
  async sendPoll(
    chat_id,
    question,
    options,
    is_anonymous = "", // Use 'false' to set it instead of Boolean false
    type = "",
    allows_multiple_answers = false,
    correct_option_id = 0,
    explanation = "",
    explanation_parse_mode = "",
    open_period = 0,
    close_date = 0,
    is_closed = false,
    disable_notification = false,
    reply_to_message_id = 0
  ) {
    let url =
      this.api +
      "/sendPoll?chat_id=" +
      chat_id +
      "&question=" +
      question +
      "&options=" +
      options;

    url = addURLOptions(url, {
      is_anonymous: is_anonymous,
      type: type,
      allows_multiple_answers: allows_multiple_answers,
      correct_option_id: correct_option_id,
      explanation: explanation,
      explanation_parse_mode: explanation_parse_mode,
      open_period: open_period,
      close_date: close_date,
      is_closed: is_closed,
      disable_notification: disable_notification,
      reply_to_message_id: reply_to_message_id,
    });

    await fetch(url);
  }

  // trigger senDice command of BotAPI
  async sendDice(
    chat_id,
    emoji = "",
    disable_notification = false,
    reply_to_message_id = 0
  ) {
    let url = this.api + "/sendDice?chat_id=" + chat_id;

    url = addURLOptions(url, {
      emoji: emoji,
      disable_notification: disable_notification,
      reply_to_message_id: reply_to_message_id,
    });

    await fetch(url);
  }

  // bot api command to get user profile photos
  async getUserProfilePhotos(user_id, offset = 0, limit = 0) {
    let url = this.api + "/getUserProfilePhotos?user_id=" + user_id;

    url = addURLOptions(url, {
      offset: offset,
      limit: limit,
    });

    return fetch(url)
      .then((response) => response.json())
      .then((json: any) => json.result.photos);
  }
}
