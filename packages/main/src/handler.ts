import BotApi from "./bot_api";
import { sha256, log } from "./libs";
import { Config, Update, localhost } from "./types";

export default class Handler {
	configs: Partial<Config>[];

	constructor(configs: Partial<Config>[]) {
		this.configs = configs;
	}

	getResponse = async (
		_request?: Request,
		_bot?: BotApi
	): Promise<Response> => {
		this.getAccessKeys(this.configs).then((access_keys) =>
			Object.keys(access_keys).forEach((key) =>
				log(
					`${access_keys[key].bot_name} ${((request_url) =>
						`${request_url.origin}${request_url.pathname}`)(
						new URL(_request?.url ?? localhost)
					)}${key}`
				)
			)
		);
		if (_bot?.webhook.token) {
			return _bot.webhook.process(new URL(_request?.url ?? localhost));
		}
		return this.responses.default();
	};

	postResponse = async (
		_request?: Request,
		_bot?: BotApi
	): Promise<Response> =>
		_bot?.webhook.token === ""
			? this.responses.default()
			: _request
			? _request
					.json()
					.then((update) => (_bot as BotApi).update(update as Update))
			: this.responses.default();

	responses: Record<
		string,
		(_request?: Request, _bot?: BotApi) => Promise<Response>
	> = {
		GET: this.getResponse,
		POST: this.postResponse,
		default: () => new Promise(() => new Response()),
	};

	getAccessKeys = async (
		configs: Partial<Config>[]
	): Promise<Record<string, Config> | Record<string, never>> =>
		Promise.all(
			configs.map((bot_config: Partial<Config>) =>
				sha256(bot_config.webhook?.token ?? "").then((hash) => [
					hash,
					bot_config,
				])
			)
		).then((result) => Object.fromEntries(result));

	// handles the request
	handle = async (request: Request): Promise<Response> =>
		this.getAccessKeys(this.configs).then((access_keys) =>
			Object.keys(this.responses).includes(request.method)
				? this.responses[request.method](
						request,
						((key) => {
							if (access_keys[key]) {
								return new access_keys[key].api({
									...new Config(),
									...access_keys[key],
									url: new URL(new URL(request.url).origin), // worker url
									handler: this,
								});
							}
							return this.responses.default();
						})(new URL(request.url).pathname.substring(1))
				  )
				: this.responses.default()
		);
}
