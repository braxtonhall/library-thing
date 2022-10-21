type GetParameters = string;
type GetResponse = string;

const get = (url: GetParameters): Promise<GetResponse> => fetch(url).then((res) => res.text());

export {get, GetParameters, GetResponse};
