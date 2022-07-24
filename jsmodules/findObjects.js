// Module for findObjects processing function and related js functions
// Exports:
// moduleName
// render(destinationElement, id)
// instance(id)
// generateCode()

// Identifier
export let moduleName = "find objects";

// internal variables:
let moduleCodePath = "../Function Interfaces/findObjectsInterface.html";
let moduleCode = null;

// Gets HTML from server for interface, puts it in moduleCode
function loadCode() {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        let HTMLcode = ""; // empty
        if (this.readyState == 4) {
            if (this.status == 200) {
                HTMLcode = this.responseText;
            }
            if (this.status == 404) {
                HTMLcode = "Page not found.";
            }
            moduleCode = HTMLcode; // set this module's variable to the code
        }
    };
    xhttp.open("GET", moduleCodePath, true);
    xhttp.send();
}

// onload of module, get moduleCode
loadCode();

// Sets innerHTML of destinationElement to this module's interface
export function render(destinationElement, id) {
    let HTMLcode = moduleCode;

    // Replaces ${string}$ in the HTML with value of function[string] in Queue
    const reg = /\${(\w+)}\$/gi;
    let match = HTMLcode.match(reg);
    if (Array.isArray(match)) {
        for (let i = 0; i < match.length; i++) {
            const newreg = /(\w+)(?=\}\$)/gi;
            let submatch =
                functionQueue.functionWithID(id)[match[i].match(newreg)];
            HTMLcode = HTMLcode.replace(match[i], submatch);
        }
    }

    // Puts interface in destinationElement
    destinationElement.innerHTML = HTMLcode;

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
            let circles = this.#find_objects(
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
                // Makes the image a color image so we can draw on it
                cv.cvtColor(img, img, cv.COLOR_GRAY2RGBA);

                //draws circle and center
                let yellow_color = new cv.Scalar(255, 255, 0, 255);
                circles.forEach(function (circle) {
                    // Draws circle
                    cv.circle(
                        img,
                        circle.center,
                        circle.radius,
                        yellow_color,
                        2
                    );
                    cv.circle(img, circle.center, 1, yellow_color, 1);

                    // Draws radius
                    let font = cv.FONT_HERSHEY_SIMPLEX;
                    cv.putText(
                        img,
                        Math.round(circle.radius).toString(),
                        {
                            x: circle.center.x - circle.radius,
                            y: circle.center.y + circle.radius,
                        },
                        font,
                        0.5,
                        yellow_color,
                        2,
                        cv.LINE_AA
                    );
                });
            }
        } catch (error) {
            console.log("Error with findObjects.execute:", error);
        }
    }

    // Finds max_objects number of minimum enclosing cirlces around objects
    // with radii between min_size and max_size
    #find_objects(img_in, max_objects, min_size, max_size) {
        // setup
        let contours = new cv.MatVector();
        let hierarchy = new cv.Mat();
        let contour_list = []; // tmp empty array for holding list

        // find contours
        cv.findContours(
            img_in,
            contours,
            hierarchy,
            cv.RETR_CCOMP,
            cv.CHAIN_APPROX_SIMPLE
        );

        // go through contours
        if (contours.size() > 0) {
            for (let i = 0; i < contours.size(); i++) {
                // check size
                var circle = cv.minEnclosingCircle(contours.get(i));
                if (circle.radius >= min_size && circle.radius <= max_size) {
                    // push object into our array
                    contour_list.push(circle);
                }
            }
            // sort results, biggest to smallest
            // code via: https://flaviocopes.com/how-to-sort-array-of-objects-by-property-javascript/
            contour_list.sort((a, b) => (a.radius > b.radius ? -1 : 1));
        } else {
            // NO CONTOURS FOUND
            //console.log('NO CONTOURS FOUND');
        }

        // return, from sorted list, those that match
        return contour_list.slice(0, max_objects); // return the biggest ones
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
