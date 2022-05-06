// Module for Threshold processing function and related js functions
// Exports:
// moduleName
// render(destinationElement, id)
// instance(id)
// generateCode()

// Identifier
export let moduleName = "threshold";

// internal variables:
let moduleCodePath = "../Function Interfaces/thresholdInterface.html";
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
        value: "100",
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
        let threshold = Number(this.params.value);

        if (color == "all") {
            cv.threshold(img, img, threshold, 255, cv.THRESH_BINARY);
        } else {
            for (var i = 0; i < img.data.length; i += 4) {
                var r = img.data[i]; // red
                var g = img.data[i + 1]; // green
                var b = img.data[i + 2]; // blue
                var a = img.data[i + 3]; // alpha
                if (color == "red" && r - g > threshold && r - b > threshold) {
                    // pixel is very red, so leave it
                } else if (
                    color == "green" &&
                    g - r > threshold &&
                    g - b > threshold
                ) {
                    // Pixel is very green so do nothing
                } else if (
                    color == "blue" &&
                    b - r > threshold &&
                    b - g > threshold
                ) {
                    // Pixel is very blue so do nothing
                } else {
                    // pixel is NOT very much the color we want, so set to black
                    img.data[i] = 0;
                    img.data[i + 1] = 0;
                    img.data[i + 2] = 0;
                }
            }
        }
    }
}

// Returns a new Threshold with id as the id
export function instance(argmap) {
    return new Threshold(argmap);
}

// TODO:
export function generateCode() {
    return "function " + moduleName + "() { }";
}
