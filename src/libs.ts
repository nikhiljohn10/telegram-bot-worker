import { v4 as uuidv4 } from "uuid";
import sha256 from "crypto-js/sha256";
export { sha256 };

// Generate JSON response
export const JSONResponse = (data, status = 200): Response =>
  new Response(JSON.stringify(data, null, 2), {
    status: status,
    headers: {
      "content-type": "application/json",
    },
  });

// Generate InlineQueryResultArticle
export const InlineQueryResultArticle = (content, parse_mode = "") => ({
  type: "article",
  id: uuidv4(),
  title: content.toString(),
  input_message_content: {
    message_text: content.toString(),
    parse_mode: parse_mode,
  },
});

// Stringify JSON and add <pre> tag HTML
export const logJSONinHTML = (data) =>
  preTagString(JSON.stringify(data, null, 2));

export const preTagString = (str) => "<pre>" + str + "</pre>";

// Add options in URL
export const addURLOptions = (urlstr, options = {}) => {
  let url = urlstr;
  for (const key of Object.keys(options)) {
    if (options[key]) url += "&" + key + "=" + options[key];
  }
  return url;
};

// get the base url for a given url string
export const getBaseURL = (url_string) => `${new URL(url_string).origin}/`;
