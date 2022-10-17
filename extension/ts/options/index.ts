import "../../sass/options.sass";
import {getAPIKey} from "../services/google/googleAuth";

window.addEventListener("load", async () => {
	const input = document.getElementById("x-api-key") as HTMLInputElement;
	document.getElementById("save-button")?.addEventListener("click", () => {
		// TODO
	});
	input.value = await getAPIKey();
});
