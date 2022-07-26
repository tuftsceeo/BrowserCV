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
}

// Returns a new findObjects with id as the id
export function instance(argmap) {
    return new FindObjects(argmap);
}

// TODO:
export function generateCode() {
    return "function " + moduleName + "() { }";
}
