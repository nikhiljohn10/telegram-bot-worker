import BotApi from "./bot_api";
import { sha256, log } from "./libs";
import {
	Config,
	PartialConfig,
	Update,
	Webhook,
	localhost,
	Commands,
} from "./types";

export default class Handler {
	configs: PartialConfig[];

	constructor(configs: PartialConfig[]) {
		this.configs = configs;
	}

	getResponse = async (
		_request?: Request,
		_bot?: BotApi
	): Promise<Response> => {
		this.getAccessKeys(this.configs).then((access_keys) =>
			Object.keys(access_keys).forEach((key) =>
				log(
					`${access_keys[key].bot_name} ${
						new URL(_request?.url ?? localhost).origin
					}/${key}`
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
	): Promise<Response> => {
		const bot =
			_bot ??
			new BotApi(
				{} as Commands,
				new Webhook(localhost, "", localhost),
				new Handler([new Config()])
			);
		if (bot.webhook.token) {
			const request = _request ?? new Request("");
			return (
				request
					.json()
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					.then((update: any) => bot.update(update as Update))
			);
		}
		return this.responses.default();
	};

	responses: Record<
		string,
		(_request?: Request, _bot?: BotApi) => Promise<Response>
	> = {
		GET: this.getResponse,
		POST: this.postResponse,
		default: () => new Promise(() => new Response()),
	};

	getAccessKeys = async (
		configs: PartialConfig[]
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	): Promise<Record<string, any> | Record<string, never>> =>
		Promise.all(
			configs.map((bot_config: PartialConfig) =>
				sha256(bot_config.webhook?.token ?? "").then((hash) => [
					hash,
					bot_config,
				])
			)
		).then((result) => Object.fromEntries(result));

	// handles the request
	handle = async (request: Request): Promise<Response> =>
		this.getAccessKeys(this.configs).then((access_keys) => {
			if (Object.keys(this.responses).includes(request.method)) {
				return this.responses[request.method](
					request,
					new access_keys[new URL(request.url).pathname.substring(1)].api({
						...new Config(),
						url: new URL(new URL(request.url).origin), // worker url
						handler: this,
						...access_keys[new URL(request.url).pathname.substring(1)],
					})
				);
			}
			return this.responses.default();
		});
}
