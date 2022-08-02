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

    generateCode(language) {
        // Setup
        let code = "";

        // Check for language
        if (language == "JavaScript") {
            // Copy functionality from actions.js replacing variables with user's options
            code += mh.codeLine("greyscaleHelper(img);");
        } else {
            // TODO: Add other language support
            throw `ERROR: Language ${language} isn't supported yet`;
        }

        // Send code to generator
        return { code: code, helperNames: ["greyscale"] };
    }
}

// Returns a new Greyscale with id of id
export function instance(argmap) {
    return new Greyscale(argmap);
}
