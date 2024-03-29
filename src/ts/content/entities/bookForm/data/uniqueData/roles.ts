import {FormMetaDataDecorator} from "../../types";
import {range} from "../../../../../common/util/range";

const ROLES_INPUT_COUNT_KEY = "_roles-count_";

const createBookEditRole = (n: number) => {
	const div = document.createElement("div");
	div.className = "bookEditRole";
	div.id = `bookEditRole${n}`;
	div.innerHTML = editRoleHTML(n);
	return div;
};

const editRoleHTML = (n: number) => `
<input class="bookEditInput bookPersonName" id="person_name-${n}" name="person_name-${n}" style="width:63%;" value="">
<select class="bookEditInput bookPersonRole" name="person_role-${n}" id="person_role-${n}" style="width: 30%;"
		onchange="onchange_show_userenter(${n});">
	<option value="" selected="">Enter role</option>
	<option value="">--------------</option>
	<option value="Afterword">Afterword</option>
	<option value="Author">Author</option>
	<option value="Composer">Composer</option>
	<option value="Contributor">Contributor</option>
	<option value="Cover artist">Cover artist</option>
	<option value="Cover designer">Cover designer</option>
	<option value="Designer">Designer</option>
	<option value="Director">Director</option>
	<option value="Editor">Editor</option>
	<option value="Foreword">Foreword</option>
	<option value="Illustrator">Illustrator</option>
	<option value="Introduction">Introduction</option>
	<option value="Narrator">Narrator</option>
	<option value="Photographer">Photographer</option>
	<option value="Preface">Preface</option>
	<option value="Translator">Translator</option>
	<option value="">--------------</option>
	<option value="xxxOTHERxxx">Other...</option>
</select>`;

/**
 * In order for us to paste in `count` number of authors, we need to have `count` number of input fields,
 * and they might not exist because users can dynamically add more fields to a form.
 * SO, `count` times, we check if an input exists. If it doesn't, we create a new one
 * This only works because the ids for these elements are predictable
 * @param formMetaData
 */
const ensureRolesInputCount = (formMetaData: Record<string, unknown>): void => {
	const count = Number(formMetaData[ROLES_INPUT_COUNT_KEY] ?? 0);
	const parent = document.getElementById("bookedit_roles");
	const control = parent.querySelector("#addPersonControl");
	if (parent && control) {
		range(0, count).forEach(
			(n) => parent.querySelector(`#person_name-${n}`) || parent.insertBefore(createBookEditRole(n), control)
		);
	}
};

// We subtract one to omit the main author, who is not part of the roles section
const getRolesInputCount = (document: Document): number =>
	document.querySelectorAll("input.bookEditInput.bookPersonName").length - 1;

const addRoleCountToMetaData: FormMetaDataDecorator = (document: Document, formMetaData: Record<string, unknown>) => ({
	...formMetaData,
	[ROLES_INPUT_COUNT_KEY]: getRolesInputCount(document),
});

export {addRoleCountToMetaData, ensureRolesInputCount};
