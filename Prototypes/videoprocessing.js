/**
 * TODO: Make functions classes
 * - Put classes in separate file as modules & export them
 *      - each class should have an .execute(), a .render(), a .showCode()
 * - Import classes from separate files (in folder) into main js file
 * - Have each module reference an html file (in html folder) that has html for
 *   the settings box for that class
 *
 * TODO: Improve functionality of FunctionQueue
 * - Swap two functions
 * - Delete function at index
 * - Insert function at index
 * -
 *
 * TODO: Do all the generating code stuff
 * - function that runs through queue and calls .showCode()
 * - makes sure parameters etc. are linked up
 * - have library of functions for copy/paste?
 *
 * TODO: Add more functions:
 * - Threshold: make RGB/All not text box, make value a slider
 * - a way to find objects in scene
 *   - contours
 *   - min enclosing circles within threshold min/max
 *   - # of objects
 *   - positions of objects
 * - eventually code where user can do something if object is within an rect
 *
 * TODO: css & making the site look pretty
 * - Backgrounds to differentiate the sections
 * - Placement
 * - Buttons and images sized for visibility / accessibility
 * - how to use the page section
 */

/*
 *
 * Class Declarations
 *
 */

// Template for all of our functions
class Greyscale {
    constructor(id) {
        this.name = "greyscale";
        this.id = id;
    }

    execute(img) {
        cv.cvtColor(img, img, cv.COLOR_RGBA2GRAY);
    }

    // Returns HTML that make a greyscale block to show on queue
    renderHTML() {
        let html = "<div id='" + this.id + "HTMLdiv" + "'><blockquote>";
        html += "<p> ID: " + this.id + " Name: " + this.name + " </p>";
        html += "</p>";
        html += "</blockquote></div>";
        return html;
    }
}

class Threshold {
    constructor(id) {
        this.name = "threshold";
        this.id = id;
        this.params = {
            color: "all",
            value: "100",
        };
    }

    get color() {
        return this.params.color;
    }

    get value() {
        return this.params.value;
    }

    execute(img) {
        let color = this.color;
        let threshold = Number(this.value);
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

    // TODO: sloppy way - xttp requests later. Just have .render()
    renderHTML() {
        let html = "<div id='" + this.id + "HTMLdiv" + "'><blockquote>";
        html += "<p> ID: " + this.id + " Name: " + this.name + " </p>";

        // Color value
        html += '<input type="text" id="' + this.id + "color" + '"';
        html += ' name="' + this.id + "color" + '" value="' + this.color + '">';
        html +=
            '<label for="' +
            this.id +
            "thresh" +
            '"> Color: red, green, blue, or all </label><br>';

        // Thresh value
        html += '<input type="text" id="' + this.id + "thresh" + '"';
        html +=
            ' name="' + this.id + "thresh" + '" value="' + this.value + '">';
        html +=
            '<label for="' + this.id + "thresh" + '"> Threshold </label><br>';

        html += "</p>";
        html += "</blockquote></div>";
        return html;
    }

    renderJS() {
        let script = "";

        // Listener for change in threshold value
        script += "var thresholdValue" + this.id + " = ";
        script += 'document.getElementById("' + this.id + "thresh" + '"); ';
        script += "thresholdValue" + this.id + ".oninput = function () {";
        script += "functionQueue.functionWithID('" + this.id + "')";
        script += ".params.value = this.value";
        script += ";}; ";

        // Listener for change in color value
        script += "var colorValue" + this.id + " = ";
        script += 'document.getElementById("' + this.id + "color" + '");';
        script += "colorValue" + this.id + ".oninput = function () {";
        script += "functionQueue.functionWithID('" + this.id + "')";
        script += ".params.color = this.value";
        script += ";}; ";

        return script;
    }
}

// Global object to track which order functions should run in
class FunctionQueue {
    constructor() {
        this.length = 0;
        this.functions = {};
        this.includes_greyscale = false;
        this.id_gen_seed = 0;
    }

    // Returns length of queue
    get len() {
        return this.length;
    }

    get funcs() {
        return this.functions;
    }

    // Returns the function at a certain point in the queue
    function_at(index) {
        if ((index >= 0) & (index < this.length)) {
            return this.functions["func" + index];
        } else {
            console.log("Please input valid index");
        }
    }

    // Add step to the function processing queue
    // Won't add greyscale twice
    add(name) {
        let temp = {};
        switch (name) {
            case "threshold":
                temp = new Threshold("ID" + this.id_gen_seed);
                break;
            case "greyscale":
                if (!this.includes_greyscale) {
                    temp = new Greyscale("ID" + this.id_gen_seed);
                    this.includes_greyscale = true;
                } else {
                    console.log("Can't greyscale more than once");
                    return;
                }
                break;
        }
        this.functions["func" + this.length] = temp;
        this.length++;
        this.id_gen_seed++;
        console.log("Added", name);
        this.showQueue("visibleQueue", "queueScripts");
    }

    // Takes last function off queue and returns a copy of it
    pop() {
        // Creates deep copy
        let temp = JSON.parse(
            JSON.stringify(this.functions["func" + (this.length - 1)])
        );
        delete this.functions["func" + (this.length - 1)];
        this.length--;
        if (temp.name == "greyscale") {
            this.includes_greyscale = false;
        }
        this.showQueue("visibleQueue", "queueScripts");
        return temp;
    }

    // Removes step from function processing queue
    removeStep() {
        if (this.len > 0) {
            console.log("Removed:", this.pop()["name"]);
        }
    }

    // Returns the function with the given ID
    functionWithID(id) {
        for (let i = 0; i < this.length; i++) {
            let func = this.functions["func" + i];
            if (func.id == id) {
                return func;
            }
        }
        console.log("No function found with id", id);
    }

    //TODO: only takes html div, since scripts shouldn't be needed
    // Updates the visual queue with latest from functionQueue
    // Also runs scripts which enable page content to modify functionQueue
    showQueue(htmlDivID, jsDivID) {
        let html = "";
        let scripts = "";
        for (let i = 0; i < this.len; i++) {
            let func = this.function_at(i);
            html += func.renderHTML();
            try {
                scripts += func.renderJS();
            } catch {}
            html += "<br>";
        }

        // Removes all lingering scripts
        let element = document.getElementById(jsDivID);
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }

        // Adds new html & scripts & runs them
        let newScript = document.createElement("script");
        newScript.innerHTML = scripts;
        newScript.id = "ID" + functionQueue.id_gen_seed;
        document.getElementById(htmlDivID).innerHTML = html;
        document.getElementById(jsDivID).appendChild(newScript);
    }
}

/*
 *
 * Global Vars
 *
 */

let functionQueue = new FunctionQueue();
let processingFunctions = ["threshold", "greyscale"];

// global variables to hold the SIZE of the input
var input_width = 320;
var input_height = 240;

// global variables to hold the SIZE of the output
var output_width = 320;
var output_height = 240;

/*
 *
 * Video & Repeated Sampling Functions
 *
 */

// Function from Prof Danahy to start streaming video (chrome only?)
function start_video(video_id) {
    var video_canvas = document.getElementById(video_id);
    // Set the width and height:
    video_canvas.setAttribute("width", input_width);
    video_canvas.setAttribute("height", input_height);
    // Get access to the camera!
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Not adding `{ audio: true }` since we only want video now
        navigator.mediaDevices
            .getUserMedia({ video: true })
            .then(function (stream) {
                video_canvas.srcObject = stream;
                video_canvas.play();
            });
    }
}

// takes video data and displays on a canvas, also can return frame as img
function display_frame(src_canvas_id, dst_canvas_id) {
    // source canvas
    var src_canvas = document.getElementById(src_canvas_id);
    // set size of destination:
    var dst_canvas = document.getElementById(dst_canvas_id);
    dst_canvas.setAttribute("width", output_width);
    dst_canvas.setAttribute("height", output_height);
    // create output canvas context
    dst_canvas_context = dst_canvas.getContext("2d");
    // draw src onto dst
    // see: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
    dst_canvas_context.drawImage(src_canvas, 0, 0, output_width, output_height);
    // return the image data
    return cv.imread(dst_canvas_id);
}

// Holder variable for interval of repeated processing
var process;

// Clears the interval variable
function resetProcessing() {
    clearInterval(process);
}

// Sets interval variable with function and interval timing
function repeatProcess(src_id, dest_id) {
    resetProcessing();
    var tempo = document.getElementById("tempo").value;
    process = setInterval(doProcess, tempo, src_id, dest_id);
}

// Iterates through each processing step before showing final image
function doProcess(src_id, dest_id) {
    // Read image from the video stream
    var img = display_frame(src_id, dest_id);

    for (let i = 0; i < functionQueue.len; i++) {
        functionQueue.function_at(i).execute(img);
    }

    // Show final image
    cv.imshow(dest_id, img);
    img.delete();
}

/*
 *
 * Page Generating Functions
 *
 */

function addButtons() {
    console.log("adding buttons");
    let buttonDiv = document.getElementById("buttons");
    for (let i = 0; i < processingFunctions.length; i++) {
        let func = processingFunctions[i];
        let button = document.createElement("button");
        button.innerHTML = func;
        button.onclick = function () {
            functionQueue.add(func);
        };
        buttonDiv.appendChild(button);
    }
}
