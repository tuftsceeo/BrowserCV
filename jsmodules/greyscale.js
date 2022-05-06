// Module for Threshold processing function and related js functions
// Exports:
// moduleName
// render(destinationElement, id)
// instance(id)
// generateCode()

// Identifier
export let moduleName = "greyscale";

// internal variables:
let moduleCodePath = "../Function Interfaces/greyscaleInterface.html";
let moduleCode = null;

// Gets HTML from server for interface, puts it in moduleCode
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
            moduleCode = HTMLcode; // set this module's variable to the code
        }
    };
    xhttp.open("GET", moduleCodePath, true);
    xhttp.send();
}

// onload of module, get moduleCode
loadCode();

// Sets innerHTML of destinationElement to this module's interface
export function render(destinationElement, id) {
    let HTMLcode = moduleCode;

    // Replaces ${string}$ in the HTML with value of function[string] in Queue
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

    // Puts interface in destinationElement
    destinationElement.innerHTML = HTMLcode;
}

// Class holding info for Greyscale
class Greyscale {
    constructor(argmap) {
        this.name = "greyscale";
        this.id = argmap.id;
    }

    execute(img) {
        cv.cvtColor(img, img, cv.COLOR_RGBA2GRAY);
    }
}

// Returns a new Greyscale with id of id
export function instance(argmap) {
    functionQueue.includes_greyscale = true;
    return new Greyscale(argmap);
}

// TODO:
export function generateCode() {
    return "function " + moduleName + "() { }";
}
