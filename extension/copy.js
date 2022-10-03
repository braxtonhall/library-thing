const saveData = () => {
    const editWindow = document.getElementById("book_editForm");
    localStorage.copyData = JSON.stringify(getSaveData(editWindow));
};

const getSaveData = (parent) => {
    const elements = getElementsByTags(parent, ["textarea", "input", "select"]);
    console.log(elements);
    return elements.reduce((acc, element) => {
        if (element.id) {
            const {value, checked} = element;
            acc[element.id] = {value, checked};
        }
        return acc;
    }, {});
};

window.addEventListener("load", () => {

    console.error("Loaded copy.js")

    // saveData();
    // TODO add my buttons (copy and paste)
    // TODO for each button, add respective listener
});
