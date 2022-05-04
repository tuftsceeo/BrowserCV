// Class holding info for Greyscale
export let moduleName = "greyscale";

class Greyscale {
    constructor(id) {
        this.name = "greyscale";
        this.id = id;
    }

    execute(img) {
        cv.cvtColor(img, img, cv.COLOR_RGBA2GRAY);
    }
}

// internal variables:
let moduleCodePath = "../Function Interfaces/greyscaleInterface.html";
let moduleCode = null;

function loadCode() {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        let HTMLcode = ""; // empty
        if (this.readyState == 4) {
            if (this.status == 200) {
                HTMLcode = this.responseText;
            }
            if (this.status == 404) {
                HTMLcode = "Page not found.";
            }
        }
        moduleCode = HTMLcode; // set this module's variable to the code
    };
    xhttp.open("GET", moduleCodePath, true);
    xhttp.send();
}
// onload of module
loadCode();

// Sets innerHTML of destinationElement to this module's interface
export function render(destinationElement, id) {
    let HTMLcode = moduleCode;

    // Replaces ${string}$ with value at function[string] in the HTML
    const reg = /\${(\w+)}\$/gi;
    let match = HTMLcode.match(reg);

    if (Array.isArray(match)) {
        for (let i = 0; i < match.length; i++) {
            const newreg = /(\w+)(?=\}\$)/gi;
            let submatch =
                functionQueue.functionWithID(id)[match[i].match(newreg)];
            HTMLcode = HTMLcode.replace(match[i], submatch);
        }
    }

    destinationElement.innerHTML = HTMLcode;
}

export function instance(id) {
    functionQueue.includes_greyscale = true;
    return new Greyscale(id);
}

export function generateCode() {
    return "function " + moduleName + "() { }";
}
