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
        value: "30",
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
        act.threshold(img, color, thresh);
    }

    generateCode(func, language) {
        // Setup
        let code = "";

        // Check for language
        if (language == "javaScript") {
            // Copy functionality from actions.js replacing variables with user's options
            // If it's using the built in threshold this is easy
            if (func.color == "all" || functionQueue.includes_greyscale) {
                code += mh.codeLine(
                    `cv.threshold(img, img, ${func.value}, 255, cv.THRESH_BINARY);`
                );
            } else {
                // Here we have to spell everything out for our custom threshold
                let lines = [
                    `let color${func.id} = "${func.color}";`,
                    `let threshold${func.id} = ${func.value};`,
                    `for (let i = 0; i < img.data.length; i += 4) {`,
                    `    let r = img.data[i]; // red`,
                    `    let g = img.data[i + 1]; // green`,
                    `    let b = img.data[i + 2]; // blue`,
                    `    let a = img.data[i + 3]; // alpha`,
                    `    if (color${func.id} == "red" && r - g > threshold${func.id} && r - b > threshold${func.id}) {`,
                    `       // pixel is very red, so leave it`,
                    `    } else if (`,
                    `        color${func.id} == "green" &&`,
                    `        g - r > threshold${func.id} &&`,
                    `        g - b > threshold${func.id}`,
                    `    ) {`,
                    `        // Pixel is very green so do nothing`,
                    `    } else if (`,
                    `        color${func.id} == "blue" &&`,
                    `        b - r > threshold${func.id} &&`,
                    `        b - g > threshold${func.id}`,
                    `    ) {`,
                    `        // Pixel is very blue so do nothing`,
                    `    } else {`,
                    `        // pixel is NOT very much the color we want, so set to black`,
                    `        img.data[i] = 0;`,
                    `        img.data[i + 1] = 0;`,
                    `        img.data[i + 2] = 0;`,
                    `    }`,
                    `}`,
                ];
                lines.forEach(function (line) {
                    code += mh.codeLine(line);
                });
            }
        }

        // Send code to generator
        return code;
    }
}

// Returns a new Threshold with id as the id
export function instance(argmap) {
    return new Threshold(argmap);
}
