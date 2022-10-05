const get = (url: string) => fetch(url).then((res) => res.text());

export {get};
