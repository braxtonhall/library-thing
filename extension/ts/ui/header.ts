/*
*
<div id="u_c19a6a5e" class="quickedit light">
	<div class="nav">
		<span class="navInfoTitle" style="margin-left: .75em;">
			Your books
		</span>
	</div>
</div>
* */

const createInfo = (text: string) => {
	const info = document.createElement("div");
	info.className = "navInfoTitle";
	info.style.marginLeft = ".75em";
	info.innerText = text;
	return info;
};

const createNav = (text: string) => {
	const nav = document.createElement("div");
	nav.className = "nav";
	nav.append(createInfo(text));
	return nav;
};

const createHeader = (text: string) => {
	const header = document.createElement("div");
	header.className = "quickedit light";
	header.append(createNav(text));
	return header;
};

export {createHeader};
