import {onFormRender} from "../entities/bookForm";

const LAST_RENDER_KEY = "_last-form-render";

let lastFormRender;

const setLastFormRender = () => (lastFormRender = Number(localStorage.getItem(LAST_RENDER_KEY)) || 0);
const getLastFormRender = () => lastFormRender;

window.addEventListener("pageshow", setLastFormRender);

onFormRender(() => {
	lastFormRender = Number(localStorage.getItem(LAST_RENDER_KEY)) || 0;
	localStorage.setItem(LAST_RENDER_KEY, String(Date.now()));
});

export {getLastFormRender};
