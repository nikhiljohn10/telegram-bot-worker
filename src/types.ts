import Bot from "./bot";
export { Bot };

export type Command = (
  bot: Bot,
  content: Record<string, string>,
  args?: string[]
) => Promise<Response>;

export type Commands = Record<string, Command>;

export type KV = {
  get: (key: string) => Promise<string>;
  put: (key: string, value: string) => Promise<boolean>;
};

export type Config = {
  bot_name: string;
  token: string;
  commands: Record<string, Command>;
  kv: KV;
};

export type Joke = {
  error: boolean;
  category: string;
  type: string;
  setup?: string;
  delivery?: string;
  joke?: string;
  flags: {
    nsfw: boolean;
    religious: boolean;
    political: boolean;
    racist: boolean;
    sexist: boolean;
    explicit: boolean;
  };
  id: number;
  safe: boolean;
  lang: string;
};

export type Bored = {
  activity: string;
  type: string;
  participants: number;
  price: number;
  link: string;
  key: string;
  accessibility: 0;
};

export type Balance = Record<
  string,
  { final_balance: number; n_tx: number; total_received: number }
>;

export type TelegramFrom = {
  first_name: string;
  id: number;
  is_bot: boolean;
  language_code: string;
  username: string;
};

export type TelegramChat = {
  id: number;
  title: string;
  type: string;
};

export type TelegramMessage = {
  chat: TelegramChat;
  date: number;
  entities: { length: number; offset: number; type: string }[];
  from: TelegramFrom;
  message_id: number;
  text: string;
};

export type InputMessageContent = {
  message_text: string;
  parse_mode: string;
};

export type TelegramInlineQuery = {
  chat_type: "sender" | "private" | "group" | "supergroup" | "channel";
  from: TelegramFrom;
  id: number;
  offset: string;
  query: string;
};

export type TelegramUpdate = {
  message?: TelegramMessage;
  inline_query?: TelegramInlineQuery;
  photo?: string;
  video?: string;
  animation?: string;
  location?: string;
  poll?: string;
  contact?: string;
  dice?: string;
  sticker?: string;
  reply_to_message?: string;
  update_id: number;
};

export class InlineQueryResultPhoto {
  type: string;
  id: string;
  photo_url: string; // must be a jpg
  thumb_url: string;

  constructor(photo) {
    this.type = "photo";
    this.id = crypto.randomUUID();
    this.photo_url = photo;
    this.thumb_url = photo;
  }
}

export class InlineQueryResultArticle {
  type: string;
  id: string;
  title: string;
  input_message_content: InputMessageContent;

  constructor(content, parse_mode = "") {
    this.type = "article";
    this.id = crypto.randomUUID();
    this.title = content.toString();
    this.input_message_content = {
      message_text: content.toString(),
      parse_mode,
    };
  }
}
