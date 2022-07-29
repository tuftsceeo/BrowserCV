// Module for findObjects processing function and related js functions
// Exports:
// moduleName
// render(destinationElement, id)
// instance(id)
// generateCode()

// Imports
import * as act from "./onImageActions/actions.js"; // for execute
import * as mh from "./moduleSetup/moduleHelper.js"; // for module setup

// Identifier
export let moduleName = "find objects";

// internal variables:
let moduleCodePath = "../Function Interfaces/findObjectsInterface.html";
// onload of module, get moduleCode
let moduleCode = { contents: null };
mh.loadCode(moduleCodePath, moduleCode);

// Sets innerHTML of destinationElement to this module's interface
export function render(destinationElement, id) {
    // Puts function interface HTML on page
    mh.displayInterface(destinationElement, id, moduleCode.contents);

    // Adds listeners to the inputs to change the function in functionQueue
    // Minimum enclosing circle size listener
    let thisFunc = functionQueue.functionWithID(id);
    let minsizeValueSelect = document.getElementById(id + "minsize");
    minsizeValueSelect.addEventListener("input", function () {
        thisFunc.params.minsize = this.value;
        document.getElementById(id + "minsizeValue").innerHTML = this.value;
    });
    // Maximum enclosing circle size listener
    let maxsizeValueSelect = document.getElementById(id + "maxsize");
    maxsizeValueSelect.addEventListener("input", function () {
        thisFunc.params.maxsize = this.value;
        document.getElementById(id + "maxsizeValue").innerHTML = this.value;
    });
    // Maximum number of objects to find listener
    let maxnumValueSelect = document.getElementById(id + "maxnum");
    maxnumValueSelect.addEventListener("input", function () {
        thisFunc.params.maxnum = this.value;
        document.getElementById(id + "maxnumValue").innerHTML = this.value;
    });
    // Visualize listener
    let visualizeSelect = document.getElementById(id + "visualize");
    visualizeSelect.addEventListener("input", function () {
        thisFunc.params.visualize = !thisFunc.params.visualize;
    });
}

// Class representing findObjects function that gets added to functionQueue
class FindObjects {
    name = "findObjects";
    params = {
        // Minimum & Maximum enclosing circle size
        minsize: 20,
        maxsize: 40,
        maxnum: 4,
        visualize: true,
    };
    outputs = {
        coords: [],
    };

    constructor(argmap) {
        this.id = argmap.id;
        if ("minsize" in argmap) {
            this.minsize = argmap.minsize;
        }
        if ("maxsize" in argmap) {
            this.maxsize = argmap.maxsize;
        }
        if ("maxnum" in argmap) {
            this.maxnum = argmap.maxnum;
        }
        if ("visualize" in argmap) {
            this.visualize = argmap.visualize;
        }
    }

    get outputs() {
        return this.outputs;
    }

    get coords() {
        return this.outputs.coords;
    }

    get minsize() {
        return this.params.minsize;
    }

    get maxsize() {
        return this.params.maxsize;
    }

    get maxnum() {
        return this.params.maxnum;
    }

    execute(img) {
        // Reset coordinates
        this.outputs.coords.length = 0;

        try {
            // Get contours around objects
            let circles = act.circleObjects(
                img,
                this.maxnum,
                this.minsize,
                this.maxsize
            );

            // For each contour, put its center as the coords of an object in
            // the outputs.coords array
            for (let i = 0; i < circles.length; i++) {
                let circle = circles[i];
                this.outputs.coords.push(circle.center);
            }

            // Visualize where contours are
            if (this.params.visualize) {
                act.drawCircles(img, circles);
            }
        } catch (error) {
            console.log("Error with find objects.execute:", error);
        }
    }

    // TODO: Find way to put helper functions in generateCode functions (maybe pass which helper functions it needs back to the main one, which includes one copy of each of the helper functions above the main function definition?)
    generateCode(language) {
        // Setup
        let code = "";

        // Check for language
        if (language == "JavaScript") {
            // Copy functionality from actions.js replacing variables with user's options

            code += mh.codeLine(`outputs.${this.id} = []`);
            code += `\ttry {
\t\t// Get contours around objects
\t\tlet circles${this.id} = circleObjectsHelper(
\t\t\timg,
\t\t\t${this.maxnum},
\t\t\t${this.minsize},
\t\t\t${this.maxsize}
\t\t);

\t\t// For each contour, put its center as the coords of an object in
\t\t// the outputs.coords array
\t\tfor (let i = 0; i < circles${this.id}.length; i++) {
\t\t\tlet circle = circles${this.id}[i];
\t\t\toutputs.${this.id}.push(circle.center);
\t\t}

\t\t// Visualize where contours are
\t\tif (${this.params.visualize}) {
\t\t\tdrawCirclesHelper(img, circles${this.id})
\t\t}
\t} catch (error) {
\t\tconsole.log("Error with find objects.execute:", error);
\t}`;
        }

        // Send code to generator
        return {
            code: code,
            helperNames: [
                "threshold",
                "greyscale",
                "circleObjects",
                "drawCircles",
            ],
        };
    }
}

// Returns a new findObjects with id as the id
export function instance(argmap) {
    return new FindObjects(argmap);
}
