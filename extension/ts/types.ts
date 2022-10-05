export type SaveData = Record<string, Record<string, any>>;

export enum ToastType {
	ERROR,
	WARNING,
	SUCCESS,
}

export interface ShowToastEvent {
	toastText: string;
	toastType: ToastType;
}
