import { Command, Update } from "./types";
import BotApi from "./bot_api";

export default class Commands {
  [key: string]: Command;
}
