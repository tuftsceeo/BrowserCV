// Module for Threshold processing function and related js functions
// Exports:
// moduleName
// render(destinationElement, id)
// instance(id)
// generateCode()

// Imports
import greyscale from "./onImageActions/greyscaleAction.js"; // for execute
import loadCode from "./moduleSetup/loadCode.js"; // for module setup
import displayInterface from "./moduleSetup/displayInterface.js"; // for module setup

// Identifier
export let moduleName = "greyscale";

// internal variables:
let moduleCodePath = "../Function Interfaces/greyscaleInterface.html";
// onload of module, get moduleCode
let moduleCode = { contents: null };
loadCode(moduleCodePath, moduleCode);

// Sets innerHTML of destinationElement to this module's interface
export function render(destinationElement, id) {
    // Puts function interface HTML on page
    displayInterface(destinationElement, id, moduleCode.contents);
}

// Class holding info for Greyscale
class Greyscale {
    constructor(argmap) {
        this.name = "greyscale";
        this.id = argmap.id;
    }

    execute(img) {
        //cv.cvtColor(img, img, cv.COLOR_RGBA2GRAY);
        greyscale(img);
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
