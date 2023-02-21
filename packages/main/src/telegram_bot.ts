import Handler from "./handler";
import {
	preTagString,
	prettyJSON,
	addSearchParams,
	responseToJSON,
} from "./libs";
import TelegramApi from "./telegram_api";
import {
	Joke,
	Bored,
	TelegramInlineQueryResultArticle,
	TelegramInlineQueryResultPhoto,
	TelegramUpdate,
	Config,
	DDGQueryResponse,
	Webhook,
	Commands,
	Kv,
} from "./types";

export default class TelegramBot extends TelegramApi {
	url: URL;
	kv: Kv;
	get_set: KVNamespace;

	constructor(config: Config) {
		super(
			config.commands as Commands,
			config.webhook as Webhook,
			config.handler as Handler
		);
		this.url = config.url;
		this.kv = config.kv as Kv;
		this.get_set = config.kv?.get_set as KVNamespace;
	}

	// bot command: /code
	code = async (update: TelegramUpdate): Promise<Response> =>
		((url) =>
			(update.inline_query &&
				this.answerInlineQuery(update.inline_query.id, [
					new TelegramInlineQueryResultArticle(url),
				])) ??
			this.sendMessage(update.message?.chat.id ?? 0, url))(
			"https://github.com/codebam/cf-workers-telegram-bot"
		);

	// bot command: /duckduckgo
	duckduckgo = async (
		update: TelegramUpdate,
		args: string[]
	): Promise<Response> =>
		((query) =>
			((duckduckgo_url) =>
				(update.inline_query &&
					query === "" &&
					this.answerInlineQuery(update.inline_query.id, [
						new TelegramInlineQueryResultArticle("https://duckduckgo.com"),
					])) ||
				(update.inline_query &&
					fetch(
						addSearchParams(new URL("https://api.duckduckgo.com"), {
							q: query,
							format: "json",
							t: "telegram_bot",
							no_redirect: "1",
						}).href
					).then((response) =>
						response
							.json()
							.then((results) => results as DDGQueryResponse)
							.then((ddg_response) =>
								((
									instant_answer_url,
									thumb_url,
									default_thumb_url = "https://duckduckgo.com/assets/icons/meta/DDG-icon_256x256.png"
								) =>
									this.answerInlineQuery(
										update.inline_query?.id ?? 0,
										(instant_answer_url !== "" && [
											new TelegramInlineQueryResultArticle(
												`${instant_answer_url}\n\n<a href="${
													addSearchParams(new URL(duckduckgo_url), {
														q: args
															.slice(1)
															.join(" ")
															.replace(/^!\w* /, ""),
													}).href
												}">Results From DuckDuckGo</a>`,
												instant_answer_url,
												"HTML",
												thumb_url
											),
											new TelegramInlineQueryResultArticle(
												duckduckgo_url,
												duckduckgo_url,
												"",
												default_thumb_url
											),
										]) || [
											new TelegramInlineQueryResultArticle(
												duckduckgo_url,
												duckduckgo_url,
												"",
												default_thumb_url
											),
										],
										3600 // 1 hour
									))(
									ddg_response.Redirect || ddg_response.AbstractURL,
									(ddg_response.Redirect === "" &&
										`https://duckduckgo.com${
											(ddg_response.Image !== "" && ddg_response.Image) ||
											(ddg_response.RelatedTopics.length !== 0 &&
												ddg_response.RelatedTopics[0].Icon.URL !== "" &&
												ddg_response.RelatedTopics[0].Icon.URL) ||
											"/i/f96d4798.png"
										}`) ||
										""
								)
							)
					)) ||
				this.sendMessage(update.message?.chat.id ?? 0, duckduckgo_url))(
				(query === "" && "https://duckduckgo.com") ||
					addSearchParams(new URL("https://duckduckgo.com"), {
						q: query,
					}).href
			))(args.slice(1).join(" "));

	// bot command: /kanye
	kanye = async (update: TelegramUpdate): Promise<Response> =>
		fetch("https://api.kanye.rest")
			.then((response) => responseToJSON(response))
			.then((json) =>
				((message) =>
					(update.inline_query !== undefined &&
						this.answerInlineQuery(update.inline_query.id, [
							new TelegramInlineQueryResultArticle(message),
						])) ||
					this.sendMessage(update.message?.chat.id ?? 0, message))(
					`Kanye says... ${json.quote}`
				)
			)
			.catch(() => new Response("Failed to parse JSON"));

	// bot command: /joke
	joke = async (update: TelegramUpdate): Promise<Response> =>
		fetch("https://v2.jokeapi.dev/joke/Any?safe-mode")
			.then((response) => responseToJSON(response))
			.then((joke) => joke as Joke)
			.then((joke_response) =>
				((message) =>
					(update.inline_query &&
						this.answerInlineQuery(
							update.inline_query.id,
							[
								new TelegramInlineQueryResultArticle(
									message,
									joke_response.joke ?? joke_response.setup,
									"HTML"
								),
							],
							0
						)) ??
					this.sendMessage(update.message?.chat.id ?? 0, message, "HTML"))(
					joke_response.joke ??
						`${joke_response.setup}\n\n<tg-spoiler>${joke_response.delivery}</tg-spoiler>`
				)
			);

	// bot command: /dog
	dog = async (update: TelegramUpdate): Promise<Response> =>
		fetch("https://shibe.online/api/shibes")
			.then((response) => response.json())
			.then((json) => json as [string])
			.then(
				(shibe_response) =>
					(update.inline_query &&
						this.answerInlineQuery(
							update.inline_query.id,
							[new TelegramInlineQueryResultPhoto(shibe_response[0])],
							0
						)) ??
					this.sendPhoto(update.message?.chat.id ?? 0, shibe_response[0])
			);

	// bot command: /cat
	cat = async (update: TelegramUpdate): Promise<Response> =>
		fetch("https://meow.senither.com/v1/random")
			.then((response) => response.json())
			.then((json) => json as { data: { url: string } })
			.then(
				(json) =>
					(update.inline_query &&
						this.answerInlineQuery(
							update.inline_query.id,
							[new TelegramInlineQueryResultPhoto(json.data.url)],
							0
						)) ??
					this.sendPhoto(update.message?.chat.id ?? 0, json.data.url)
			);

	// bot command: /bored
	bored = async (update: TelegramUpdate): Promise<Response> =>
		fetch("https://boredapi.com/api/activity/")
			.then((response) => responseToJSON(response))
			.then((json) => json as Bored)
			.then(
				(bored_response) =>
					(update.inline_query &&
						this.answerInlineQuery(
							update.inline_query.id,
							[new TelegramInlineQueryResultArticle(bored_response.activity)],
							0
						)) ??
					this.sendMessage(
						update.message?.chat.id ?? 0,
						bored_response.activity
					)
			);

	// bot command: /epoch
	epoch = async (update: TelegramUpdate): Promise<Response> =>
		((seconds) =>
			(update.inline_query &&
				this.answerInlineQuery(
					update.inline_query.id,
					[new TelegramInlineQueryResultArticle(seconds)],
					0
				)) ??
			this.sendMessage(update.message?.chat.id ?? 0, seconds))(
			Math.floor(Date.now() / 1000).toString()
		);

	// bot command: /get
	_get = async (update: TelegramUpdate, args: string[]): Promise<Response> =>
		((key) =>
			this.get_set
				.get(key)
				.then(
					(value) =>
						(update.inline_query &&
							this.answerInlineQuery(
								update.inline_query.id,
								[new TelegramInlineQueryResultArticle(value ?? "")],
								0
							)) ??
						this.sendMessage(update.message?.chat.id ?? 0, value ?? "")
				))(args[1]);

	// bot command: /set
	_set = async (update: TelegramUpdate, args: string[]): Promise<Response> => {
		const key = args[1];
		const value = args.slice(2).join(" ");
		const message = `set ${key} to ${value}`;
		this.get_set.put(key, value).then(() => {
			if (update.inline_query) {
				return this.answerInlineQuery(
					update.inline_query.id,
					[new TelegramInlineQueryResultArticle(message)],
					0
				);
			}
			return this.sendMessage(update.message?.chat.id ?? 0, message);
		});
		return new Response();
	};

	_average = (numbers: number[]): number =>
		parseFloat(
			(
				numbers.reduce((prev, cur) => prev + cur, 0) / numbers.length || 0
			).toFixed(2)
		);

	// bot command: /recursion
	recursion = async (update: TelegramUpdate): Promise<Response> =>
		this.sendMessage(update.message?.chat.id ?? 0, "/recursion");
	// .then((response) => responseToJSON(response))
	// .then((result: { ok: boolean; result: { text: string } }) =>
	//   this.handler.postResponse(
	//     new Request("", {
	//       method: "POST",
	//       body: JSON.stringify({
	//         message: {
	//           text: result.result.text,
	//           chat: { id: update.message.chat.id },
	//         },
	//       }),
	//     }),
	//     this
	//   )
	// );

	// bot command: /roll
	roll = async (update: TelegramUpdate, args: string[]): Promise<Response> =>
		((outcome, message) =>
			(update.inline_query &&
				this.answerInlineQuery(update.inline_query.id, [
					new TelegramInlineQueryResultArticle(
						message(
							update.inline_query.from.username,
							update.inline_query.from.first_name,
							outcome
						)
					),
				])) ??
			this.sendMessage(
				update.message?.chat.id ?? 0,
				message(
					update.message?.from.username ?? "",
					update.message?.from.first_name ?? "",
					outcome
				)
			))(
			Math.floor(Math.random() * (parseInt(args[1]) || 6 - 1 + 1) + 1),
			(username: string, first_name: string, outcome: number) =>
				`${first_name ?? username} rolled a ${
					parseInt(args[1]) || 6
				} sided die. it landed on ${outcome}`
		);

	// bot command: /commandList
	commandList = async (update: TelegramUpdate): Promise<Response> =>
		this.sendMessage(
			update.message?.chat.id ?? 0,
			`<pre>${JSON.stringify(Object.keys(this.commands))}</pre>`,
			"HTML"
		);

	// bot command: /toss
	toss = async (update: TelegramUpdate): Promise<Response> =>
		this.sendMessage(
			update.message?.chat.id ?? 0,
			Math.floor(Math.random() * 2) == 0 ? "heads" : "tails"
		);

	// bot command: /ping
	ping = async (update: TelegramUpdate, args: string[]): Promise<Response> =>
		this.sendMessage(
			update.message?.chat.id ?? 0,
			args.length === 1 ? "pong" : args.slice(1).join(" ")
		);

	// bot command: /chatInfo
	getChatInfo = async (update: TelegramUpdate): Promise<Response> =>
		this.sendMessage(
			update.message?.chat.id ?? 0,
			preTagString(prettyJSON(update.message?.chat ?? 0)),
			"HTML"
		);
}
