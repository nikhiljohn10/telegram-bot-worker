import Webhook from "./webhook";
import { InlineQueryResultArticle, addURLOptions } from "./libs";
import hasOwn from "core-js-pure/es/object/has-own";

export default class Bot {
  token: string;
  commands: any;
  api: string;
  webhook: Webhook;
  kv: any;

  constructor(config) {
    this.token = config.token;
    this.commands = config.commands;
    this.api = "https://api.telegram.org/bot" + config.token;
    this.webhook = new Webhook(this.api, config.token, config.url);
    this.kv = config.kv;
  }

  update = async (request, content): Promise<Response> => {
    if (hasOwn(content, "inline_query")) {
      if (!(await this.executeInlineCommand(request, content))) {
        // don't send messages on invalid commands
      }
    } else if (hasOwn(content, "message")) {
      if (hasOwn(content.message, "text")) {
        // Test command and execute
        this.executeCommand(request, content)
          .then((response) =>
            response.json().then((json) => console.log({ response: json }))
          )
          .catch(console.error);
      } else if (hasOwn(content, "photo")) {
        // process photo
      } else if (hasOwn(content, "video")) {
        // process video
      } else if (hasOwn(content, "animation")) {
        // process animation
      } else if (hasOwn(content, "location")) {
        // process locaiton
      } else if (hasOwn(content, "poll")) {
        // process poll
      } else if (hasOwn(content, "contact")) {
        // process contact
      } else if (hasOwn(content, "dice")) {
        // process dice
      } else if (hasOwn(content, "sticker")) {
        // process sticker
      } else if (hasOwn(content, "reply_to_message")) {
        // process reply of a message
      }
    } else {
      // process unknown type
    }
    // return 200 OK response to every update request
    return new Response("True", {
      status: 200,
    });
  };

  // execute the inline custom bot commands from bot configurations
  executeInlineCommand = async (request, content) => {
    const inlinecmdArray = content.inline_query.query.split(" ");
    const inline_command = inlinecmdArray.shift();
    const isinlineCommand = Object.keys(this.commands).includes(inline_command);
    if (isinlineCommand) {
      await this.commands[inline_command](this, request, inlinecmdArray);
      return true;
    }
    return false;
  };

  // execute the custom bot commands from bot configurations
  executeCommand = async (request, content): Promise<Response> => {
    const cmdArray = content.message.text.split(" ");
    const command = cmdArray.shift();
    if (Object.keys(this.commands).includes(command)) {
      return this.commands[command](this, request, cmdArray);
    }
    return new Response();
  };

  // trigger answerInlineQuery command of BotAPI
  answerInlineQuery = async (
    inline_query_id,
    results,
    cache_time = 0,
    parse_mode = ""
  ) => {
    const url = `${
      this.api
    }/answerInlineQuery?inline_query_id=${inline_query_id}&results=${encodeURIComponent(
      JSON.stringify([InlineQueryResultArticle(results, parse_mode)])
    )}&cache_time=${cache_time}`;
    return fetch(url);
  };

  // trigger sendMessage command of BotAPI
  sendMessage = async (
    chat_id,
    text,
    parse_mode = "",
    disable_web_page_preview = false,
    disable_notification = false,
    reply_to_message_id = 0
  ): Promise<Response> => {
    let url = `${
      this.api
    }/sendMessage?chat_id=${chat_id}&text=${encodeURIComponent(text)}`;
    url = addURLOptions(url, {
      parse_mode: parse_mode,
      disable_web_page_preview: disable_web_page_preview,
      disable_notification: disable_notification,
      reply_to_message_id: reply_to_message_id,
    });
    return fetch(url);
  };

  // trigger forwardMessage command of BotAPI
  forwardMessage = async (
    chat_id,
    from_chat_id,
    disable_notification = false,
    message_id
  ) => {
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
    return fetch(url);
  };

  // trigger sendPhoto command of BotAPI
  sendPhoto = async (
    chat_id,
    photo,
    caption = "",
    parse_mode = "",
    disable_notification = false,
    reply_to_message_id = 0
  ) => {
    let url = this.api + "/sendPhoto?chat_id=" + chat_id + "&photo=" + photo;
    url = addURLOptions(url, {
      caption: caption,
      parse_mode: parse_mode,
      disable_notification: disable_notification,
      reply_to_message_id: reply_to_message_id,
    });
    return fetch(url);
  };

  // trigger sendVideo command of BotAPI
  sendVideo = async (
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
  ) => {
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
    return fetch(url);
  };

  // trigger sendAnimation command of BotAPI
  sendAnimation = async (
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
  ) => {
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
    return fetch(url);
  };

  // trigger sendLocation command of BotAPI
  sendLocation = async (
    chat_id,
    latitude,
    longitude,
    live_period = 0,
    disable_notification = false,
    reply_to_message_id = 0
  ) => {
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
    return fetch(url);
  };

  // trigger senPoll command of BotAPI
  sendPoll = async (
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
  ) => {
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
    return fetch(url);
  };

  // trigger senDice command of BotAPI
  sendDice = async (
    chat_id,
    emoji = "",
    disable_notification = false,
    reply_to_message_id = 0
  ) => {
    let url = this.api + "/sendDice?chat_id=" + chat_id;
    url = addURLOptions(url, {
      emoji: emoji,
      disable_notification: disable_notification,
      reply_to_message_id: reply_to_message_id,
    });
    return fetch(url);
  };

  // bot api command to get user profile photos
  getUserProfilePhotos = async (user_id, offset = 0, limit = 0) => {
    let url = this.api + "/getUserProfilePhotos?user_id=" + user_id;
    url = addURLOptions(url, {
      offset: offset,
      limit: limit,
    });
    return fetch(url)
      .then((response) => response.json())
      .then((json: any) => json.result.photos);
  };
}
