import * as cheerio from "cheerio";

const get = (url: string) => fetch(url).then((res) => res.text());

const get$ = (url: string) => get(url).then((text) => cheerio.load(text))

export {get, get$};
