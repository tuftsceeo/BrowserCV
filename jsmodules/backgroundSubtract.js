// Module for backgroundSubtract processing function and related js functions
// Exports:
// moduleName
// render(destinationElement, id)
// instance(id)
// generateCode()

// Imports
import * as act from "./onImageActions/actions.js"; // for execute
import * as mh from "./moduleSetup/moduleHelper.js"; // for module setup

// Identifier
export let moduleName = "subtract background";

// internal variables:
// TODO: function interface
let moduleCodePath = "../Function Interfaces/backgroundSubtractInterface.html";
// onload of module, get moduleCode
let moduleCode = { contents: null };
mh.loadCode(moduleCodePath, moduleCode);

// Sets innerHTML of destinationElement to this module's interface
export function render(destinationElement, id) {
    // Puts function interface HTML on page
    mh.displayInterface(destinationElement, id, moduleCode.contents);
}

// Class representing backgroundSubtract function that gets added to functionQueue
class BackgroundSubtract {
    name = "backgroundSubtract";

    constructor(argmap) {
        this.id = argmap.id;
        this.fgbg = new cv.BackgroundSubtractorMOG2(500, 16, true);
    }

    clean() {
        this.fgbg.delete();
    }

    execute(img) {
        this.fgbg.apply(img, img);
        cv.cvtColor(img, img, cv.COLOR_GRAY2BGRA);
    }

    generateCode(language) {
        // Setup
        let code = "";

        if (language == "JavaScript") {
            const lines = [
                `fgbg.apply(img, img);`,
                `cv.cvtColor(img, img, cv.COLOR_GRAY2BGRA);`,
            ];
            lines.forEach((line) => {
                code += mh.codeLine(line);
            });
        } else {
            throw `Language: ${language} not currently supported`;
        }

        return {
            code: code,
            helperNames: ["backgroundSubtract"],
        };
    }
}

// Returns a new findColor with id as the id
export function instance(argmap) {
    return new BackgroundSubtract(argmap);
}
