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
    generateCode(func, language) {
        // Setup
        let code = "";

        // Check for language
        if (language == "javaScript") {
            // Copy functionality from actions.js replacing variables with user's options

            code += codeLine(`outputs.${func.id} = []`);
            code += `\ttry {
\t\t// Get contours around objects
\t\tlet contours${func.id} = new cv.MatVector();
\t\tlet hierarchy${func.id} = new cv.Mat();
\t\tlet contour_list${func.id} = []; // tmp empty array for holding list

\t\t// find contours
\t\tcv.findContours(
\t\t\timg,
\t\t\tcontours${func.id},
\t\t\thierarchy${func.id},
\t\t\tcv.RETR_CCOMP,
\t\t\tcv.CHAIN_APPROX_SIMPLE
\t\t);

\t\t// go through contours
\t\tif (contours${func.id}.size() > 0) {
\t\t\tfor (let i = 0; i < contours${func.id}.size(); i++) {
\t\t\t\t// check size
\t\t\t\tvar circle${func.id} = cv.minEnclosingCircle(contours${func.id}.get(i));
\t\t\t\tif (circle${func.id}.radius >= ${func.minsize} && circle${func.id}.radius <= ${func.maxsize}) {
\t\t\t\t\t// push object into our array
\t\t\t\t\tcontour_list${func.id}.push(circle${func.id});
\t\t\t\t}
\t\t\t}
\t\t\t// sort results, biggest to smallest
\t\t\t// code via: https://flaviocopes.com/how-to-sort-array-of-objects-by-property-javascript/
\t\t\tcontour_list${func.id}.sort((a, b) => (a.radius > b.radius ? -1 : 1));
\t\t} else {
\t\t\t// NO CONTOURS FOUND
\t\t\t//console.log('NO CONTOURS FOUND');
\t\t}

\t\t// take, from sorted list, those that match our max number of objects
\t\tcircles${func.id} = contour_list${func.id}.slice(0, ${func.maxnum}); // return the biggest ones

\t\t// For each contour, put its center as the coords of an object in
\t\t// the outputs.coords array
\t\tfor (let i = 0; i < circles${func.id}.length; i++) {
\t\t\tlet circle = circles${func.id}[i];
\t\t\toutputs.${func.id}.push(circle.center);
\t\t}

\t\t// Visualize where contours are
\t\tif (${func.params.visualize}) {
\t\t\t// Makes the image a color image so we can draw on it
\t\t\tcv.cvtColor(img, img, cv.COLOR_GRAY2RGBA);
\t\t\t
\t\t\t//draws circle and center
\t\t\tlet yellow_color${func.id} = new cv.Scalar(255, 255, 0, 255);
\t\t\tcircles${func.id}.forEach(function (circle) {
\t\t\t\t// Draws circle
\t\t\t\tcv.circle(img, circle.center, circle.radius, yellow_color${func.id}, 2);
\t\t\t\tcv.circle(img, circle.center, 1, yellow_color${func.id}, 1);

\t\t\t\t// Draws radius
\t\t\t\tlet font${func.id} = cv.FONT_HERSHEY_SIMPLEX;
\t\t\t\tcv.putText(
\t\t\t\t\timg,
\t\t\t\t\tMath.round(circle.radius).toString(),
\t\t\t\t\t{
\t\t\t\t\t\tx: circle.center.x - circle.radius,
\t\t\t\t\t\ty: circle.center.y + circle.radius,
\t\t\t\t\t},
\t\t\t\t\tfont${func.id},
\t\t\t\t\t0.5,
\t\t\t\t\tyellow_color${func.id},
\t\t\t\t\t2,
\t\t\t\t\tcv.LINE_AA
\t\t\t\t);
\t\t\t});
\t\t}
\t} catch (error) {
\t\tconsole.log("Error with find objects.execute:", error);
\t}`;
        }

        // Send code to generator
        return code;
    }
}

// Returns a new findObjects with id as the id
export function instance(argmap) {
    return new FindObjects(argmap);
}
