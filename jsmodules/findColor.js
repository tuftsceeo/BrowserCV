// Module for findColor processing function and related js functions
// Exports:
// moduleName
// render(destinationElement, id)
// instance(id)
// generateCode()

// Imports
import circleObjects from "./onImageActions/circleObjectsAction.js"; // for execute
import drawCircles from "./onImageActions/drawCirclesAction.js"; // for execute
import threshold from "./onImageActions/thresholdAction.js"; // for execute
import loadCode from "./moduleSetup/loadCode.js"; // for module setup
import displayInterface from "./moduleSetup/displayInterface.js"; // for module setup

// Identifier
export let moduleName = "find color";

// internal variables:
let moduleCodePath = "../Function Interfaces/findColorInterface.html";
// onload of module, get moduleCode
let moduleCode = { contents: null };
loadCode(moduleCodePath, moduleCode);

// Sets innerHTML of destinationElement to this module's interface
export function render(destinationElement, id) {
    // Puts function interface HTML on page
    displayInterface(destinationElement, id, moduleCode.contents);

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
    // Color select listener
    let colorSelect = document.getElementById(id + "color");
    colorSelect.addEventListener("input", function () {
        functionQueue.functionWithID(id).params.color = this.value;
    });

    // Brightness value listener
    let threshValueSelect = document.getElementById(id + "thresh");
    threshValueSelect.addEventListener("input", function () {
        functionQueue.functionWithID(id).params.brightness = this.value;
        document.getElementById(id + "threshValue").innerHTML = this.value;
    });
}

// Class representing findColor function that gets added to functionQueue
class FindColor {
    name = "findColor";
    params = {
        // Minimum & Maximum enclosing circle size
        color: "red",
        brightness: 30,
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
        if ("color" in argmap) {
            this.color = argmap.color;
        }
        if ("brightness" in argmap) {
            this.brightness = argmap.brightness;
        }
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

    get color() {
        return this.params.color;
    }

    get brightness() {
        return this.params.brightness;
    }

    execute(img) {
        // Threshold the image to the given brightness and color
        threshold(img, this.color, this.brightness);

        // Binary the image (Greyscale it then thresh again)
        try {
            cv.cvtColor(img, img, cv.COLOR_RGBA2GRAY);
        } catch (error) {
            cv.cvtColor(img, img, cv.COLOR_GRAY2RGBA);
            cv.cvtColor(img, img, cv.COLOR_RGBA2GRAY);
        }
        cv.threshold(img, img, 0, 255, cv.THRESH_BINARY);

        // Reset output coords
        this.outputs.coords.length = 0;

        try {
            // Get contours around objects
            let circles = circleObjects(
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
                drawCircles(img, circles);
            }
        } catch (error) {
            console.log("Error with find color:", error);
        }
    }
}

// Returns a new findColor with id as the id
export function instance(argmap) {
    return new FindColor(argmap);
}

// TODO:
export function generateCode() {
    return "function " + moduleName + "() { }";
}
