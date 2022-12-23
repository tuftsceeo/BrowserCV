// Module for Threshold processing function and related js functions
// Exports:
// moduleName
// render(destinationElement, id)
// instance(id)
// generateCode()

// Imports
import * as act from "./onImageActions/actions.js"; // for execute
import * as mh from "./moduleSetup/moduleHelper.js"; // for module setup

// Identifier
export let moduleName = "threshold";

// onload of module, get moduleCode
let moduleCodePath = "../Function Interfaces/thresholdInterface.html";
let moduleCode = { contents: null };
mh.loadCode(moduleCodePath, moduleCode);

// Sets innerHTML of destinationElement to this module's interface
export function render(destinationElement, id) {
    // Puts function interface HTML on page
    mh.displayInterface(destinationElement, id, moduleCode.contents);

    // Hides color select at first
    let colorSelector = document.getElementById(id + "colorSelect");
    colorSelector.style.display = "none";

    // Adds listeners to the inputs to change the function in functionQueue
    // Color select listener
    let colorSelect = document.getElementById(id + "color");
    colorSelect.addEventListener("input", function () {
        functionQueue.functionWithID(id).params.color = this.value;
    });

    // Threshold value listener
    let threshValueSelect = document.getElementById(id + "thresh");
    threshValueSelect.addEventListener("input", function () {
        functionQueue.functionWithID(id).params.value = this.value;
        document.getElementById(id + "threshValue").innerHTML = this.value;
    });

    // Type listener
    let typeSelect = document.getElementById(id + "type");
    typeSelect.addEventListener("input", function () {
        functionQueue.functionWithID(id).params.type = this.value;
        if (this.value == "color") {
            colorSelector.style.display = "block";
        } else if (this.value == "adaptive") {
            threshValueSelect.max = 50;
            colorSelector.style.display = "none";
        } else {
            colorSelector.style.display = "none";
            threshValueSelect.max = 255;
        }
    });
}

// Class representing Threshold function that gets added to functionQueue
class Threshold {
    name = "threshold";
    params = {
        color: "red",
        value: 30,
        type: "binary",
    };

    constructor(argmap) {
        this.id = argmap.id;
        if ("color" in argmap) {
            this.params.color = argmap.color;
        }
        if ("value" in argmap) {
            this.params.value = argmap.value;
        }
        if ("type" in argmap) {
            this.params.type = argmap.type;
        }
    }

    get color() {
        return this.params.color;
    }

    get value() {
        return this.params.value;
    }

    get type() {
        return this.params.type;
    }

    execute(img) {
        // Get values
        let color = this.params.color;
        let thresh = Number(this.params.value);
        let type = this.params.type;

        // Perform thresholding
        act.threshold(img, type, thresh, color);
    }

    generateCode(language) {
        // Setup
        let code = "";
        let color = this.color;
        let value = this.value;
        let type = this.type;

        // Code: uses helper function
        if (language == "JavaScript") {
            code += mh.codeLine(
                `thresholdHelper(img, "${type}", ${value}, "${color}");`
            );
        } else if (language == "Python") {
            code += mh.codeLine(
                `img = thresholdHelper(img, "${type}", ${value}, "${color}")`
            );
        } else {
            // TODO: Add other language support
            throw `ERROR: Language ${language} isn't supported yet`;
        }

        // Send code to generator
        return { code: code, helperNames: ["threshold"] };
    }
}

// Returns a new Threshold with id as the id
export function instance(argmap) {
    return new Threshold(argmap);
}
