type FormAreaElement = HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement;
type FormData = Record<string, Record<string, any>>;

type FormMetaDataDecorator = (document: Document, formMetaData: Record<string, unknown>) => Record<string, unknown>;

export type {FormAreaElement, FormData, FormMetaDataDecorator};
