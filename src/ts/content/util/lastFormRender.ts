import {onFormRender} from "../entities/bookForm";
import config, {ConfigKey} from "../../common/entities/config";

let lastFormRender;

const setLastFormRender = async () => (lastFormRender = await config.get(ConfigKey.LatestRender));
const getLastFormRender = () => lastFormRender;

window.addEventListener("pageshow", setLastFormRender);

onFormRender(async () => {
	await setLastFormRender();
	await config.set(ConfigKey.LatestRender, Date.now());
});

export {getLastFormRender};
