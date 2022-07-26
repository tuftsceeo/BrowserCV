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
export let moduleName = "greyscale";

// internal variables:
let moduleCodePath = "../Function Interfaces/greyscaleInterface.html";
// onload of module, get moduleCode
let moduleCode = { contents: null };
mh.loadCode(moduleCodePath, moduleCode);

// Sets innerHTML of destinationElement to this module's interface
export function render(destinationElement, id) {
    // Puts function interface HTML on page
    mh.displayInterface(destinationElement, id, moduleCode.contents);
}

// Class holding info for Greyscale
class Greyscale {
    constructor(argmap) {
        this.name = "greyscale";
        this.id = argmap.id;
    }

    execute(img) {
        //cv.cvtColor(img, img, cv.COLOR_RGBA2GRAY);
        act.greyscale(img);
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
