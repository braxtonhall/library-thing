interface FinderParameters {
	author: string;
	title: string;
	isbn: string;
}

type Finder<T> = (parameters: FinderParameters) => Promise<T>;

export {FinderParameters, Finder};
