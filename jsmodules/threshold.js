// Module for Threshold processing function and related js functions
// Exports:
// moduleName
// render(destinationElement, id)
// instance(id)
// generateCode()

// Imports
import threshold from "./onImageActions/thresholdAction.js"; // for execute
import loadCode from "./moduleSetup/loadCode.js"; // for module setup
import displayInterface from "./moduleSetup/displayInterface.js"; // for module setup

// Identifier
export let moduleName = "threshold";

// onload of module, get moduleCode
let moduleCodePath = "../Function Interfaces/thresholdInterface.html";
let moduleCode = { contents: null };
loadCode(moduleCodePath, moduleCode);

// Sets innerHTML of destinationElement to this module's interface
export function render(destinationElement, id) {
    // Puts function interface HTML on page
    displayInterface(destinationElement, id, moduleCode.contents);

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
}

// Class representing Threshold function that gets added to functionQueue
class Threshold {
    name = "threshold";
    params = {
        color: "all",
        value: "100",
    };

    constructor(argmap) {
        this.id = argmap.id;
        if ("color" in argmap) {
            this.params.color = argmap.color;
        }
        if ("value" in argmap) {
            this.params.value = argmap.value;
        }
    }

    get color() {
        return this.params.color;
    }

    get value() {
        return this.params.value;
    }

    execute(img) {
        // Get values
        let color = this.params.color;
        let thresh = Number(this.params.value);

        // Perform thresholding
        threshold(img, color, thresh);
    }
}

// Returns a new Threshold with id as the id
export function instance(argmap) {
    return new Threshold(argmap);
}

// TODO:
export function generateCode() {
    return "function " + moduleName + "() { }";
}
