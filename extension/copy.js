const saveData = (parent) =>
    (event) => {
        event.preventDefault();
        localStorage.copyData = JSON.stringify(getSaveData(parent))
    };

const loadData = (parent) =>
    (event) => {
        event.preventDefault();
        const copyData = JSON.parse(localStorage.copyData);
        insertSaveData(parent, copyData);
    }

const getSaveData = (parent) => {
    const elements = getElementsByTags(parent, RELEVANT_TAGS);
    return elements.reduce((acc, element) => {
        if (element.id) {
            const {value, checked} = element;
            if (element.id.startsWith("collection_u_")) {
                const collections = acc[COLLECTIONS_KEY] || {};
                const [span] = element.parentElement.getElementsByTagName("span");
                collections[span.textContent] = {value, checked};
                acc[COLLECTIONS_KEY] = collections;
            } else {
                acc[element.id] = {value, checked};
            }
        }
        return acc;
    }, {});
};

const insertSaveData = (parent, saveData) => {
    const elements = getElementsByTags(parent, RELEVANT_TAGS);
    return elements.forEach((element) => {
        if (element.id) {
            let saveElement = element;
            if (element.id.startsWith("collection_u_")) {
                const [span] = element.parentElement.getElementsByTagName("span");
                saveElement = saveData[COLLECTIONS_KEY][span.textContent] || element;
            } else {
                saveElement = saveData[element.id] || element;
                
            }
            element.value = saveElement.value;
            element.checked = saveElement.checked;
        }
    });
};

window.addEventListener("load", () => {

    const [editWindow] = document.getElementsByClassName("book_bit");

    Array.from(document.getElementsByClassName("book_bitTable")).forEach((element) => {
        const saveButton = document.createElement("button");
        const loadButton = document.createElement("button");

        saveButton.innerHTML = 'SAVE';
        loadButton.innerHTML = 'LOAD';

        saveButton.addEventListener("click", saveData(editWindow));
        loadButton.addEventListener("click", loadData(editWindow));

        element.appendChild(saveButton);
        element.appendChild(loadButton);

    });
});
