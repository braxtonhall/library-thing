type Transformer = (options: TransformerParameters) => { key: string, value: unknown };
type TransformerParameters = {key: string, value: unknown, manifest: any};

const toV2 = (v3) =>
	Object.entries(v3)
		.reduce((v2, [key, value]): Record<string, unknown> => {
			const transformer = transformers[key] ?? identity;
			const {key: newKey, value: newValue} = transformer({value, key, manifest: v3});
			return {...v2, [newKey]: newValue};
		}, {});

const retainKey = (callback: ({value, manifest}) => unknown): Transformer =>
	({key, value, manifest}) =>
		({key, value: callback({value, manifest})});

const fixedValue = (value: unknown) => retainKey(() => value);

const identity = retainKey(({value}) => value);
const transformers: { [key: string]: Transformer } = {
	manifest_version: fixedValue(2),
	options_page: fixedValue(undefined),
	action: ({value}) => ({key: "browser_action", value}),
	content_security_policy: fixedValue(undefined),
	key: () => ({
		key: "browser_specific_settings",
		value: {
			gecko: {
				id: "{ae1ccbaf-b9e4-44e4-b0b1-005db1c0dbd2}"
			}
		}
	}),
	host_permissions: fixedValue(undefined),
	background: retainKey(({value}) => ({
		"scripts": [value.service_worker],
		"persistent": false
	})),
	permissions: retainKey(({value, manifest}) => [...value, ...manifest.host_permissions]),
	web_accessible_resources: retainKey(({value}) => value.flatMap(entry => entry.resources))
};

export {toV2};
