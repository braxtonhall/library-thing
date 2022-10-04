window.addEventListener("load", () => {
	const masthead = document.getElementById("masthead");
	if (masthead) {
		masthead.style["transition"] = "1s";
		masthead.style["filter"] = "invert(80%)";
		masthead.style["-webkit-filter"] = "invert(80%)";
	}
});
