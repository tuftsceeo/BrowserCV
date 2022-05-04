// Exports:
// moduleName
// render(document.getelementbyID('target'))
// instance(id) {return new Threshold(id)}
//
export let moduleName = "threshold";

// internal variables:
let moduleCodePath = "../Function Interfaces/thresholdInterface.html";
let moduleCode = null;

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
        }
        moduleCode = HTMLcode; // set this module's variable to the code
        console.log(HTMLcode);
    };
    xhttp.open("GET", moduleCodePath, true);
    xhttp.send();
}
// onload of module
loadCode();

// Sets innerHTML of destinationElement to this module's interface
export function render(destinationElement, id) {
    let HTMLcode = moduleCode;

    // Replaces ${string}$ with value at function[string] in the HTML
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

    destinationElement.innerHTML = HTMLcode;

    let colorSelect = document.getElementById(id + "color");
    colorSelect.addEventListener("input", function () {
        functionQueue.functionWithID(id).params.color = this.value;
    });

    let threshValueSelect = document.getElementById(id + "thresh");
    threshValueSelect.addEventListener("input", function () {
        functionQueue.functionWithID(id).params.value = this.value;
        //document.getElementById(id + "threshValue").innerHTML = this.value;
    });
}

class Threshold {
    name = "threshold";
    params = {
        color: "all",
        value: "100",
    };

    constructor(id) {
        this.id = id;
    }

    get color() {
        return this.params.color;
    }

    get value() {
        return this.params.value;
    }

    execute(img) {
        let color = this.params.color;
        let threshold = Number(this.params.value);
        if (
            color != "all" &&
            color != "red" &&
            color != "blue" &&
            color != "green"
        ) {
            // console.log("incorrect color");
            return;
        }
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

export function instance(id) {
    return new Threshold(id);
}

export function generateCode() {
    return "function " + moduleName + "() { }";
}
