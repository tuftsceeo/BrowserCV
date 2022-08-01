/**
 * TODO: Bugs
 * - Greyscale + Threshold functionality (threshold is currently changing behavior even if greyscale is after it in the queue)
 *
 * TODO: Improve functionality of FunctionQueue
 * - Swap two functions
 *
 * TODO: Add more functions:
 * - makebitmap (thresh all 0)
 * - Something using the radius of an object to find its size
 * - Location of object within 3x3 grid, passes back 1-9
 * - Motional detection (subtracts one frame from another)
 *
 */

/*
 *
 * Global Vars and Importing Global Functions
 *
 */

// global variables to hold the SIZE of the input
var input_width = 320;
var input_height = 240;

// global variables to hold the SIZE of the output
var output_width = 320;
var output_height = 240;

// Get helper functions
let codeLine, generateCode, copyToClip;
import("../jsmodules/moduleSetup/moduleHelper.js").then((mh) => {
    codeLine = mh.codeLine;
    copyToClip = mh.copyToClip;
});
import("../jsmodules/generateCode/generateCode.js").then((gc) => {
    generateCode = gc.generateCode;
});

// Set up functionQueue
var functionQueue;
import("../jsmodules/functionQueue.js").then((Module) => {
    functionQueue = Module.instance();
});

// List of functions that exist to import
let processingFunctions = [
    "threshold",
    "greyscale",
    "findObjects",
    "findColor",
];

// Used in internal testing of the generateCode function. Paste generateCode function into console then set to true via console to see what generateCode function is doing
let test = false;

/*
 *
 * Page Setup
 *
 */

// Generates button on page for a given function module
function addButton(ModulePointer) {
    // destination div
    let buttonDiv = document.getElementById("buttons");
    // create new button
    let button = document.createElement("button");
    button.id = ModulePointer.moduleName;
    button.innerHTML = "Add " + ModulePointer.moduleName;

    // Adds function to functionQueue when clicked & generates interface
    button.addEventListener("click", () => {
        // add to functionQueue
        let id = functionQueue.add(ModulePointer);
        if (!id) {
            throw `Error adding ${ModulePointer.moduleName}, functionQueue.add didn't return an ID`;
        }
        // render interface
        let newDiv = document.createElement("div");
        newDiv.id = id;
        newDiv.classList.add("section"); // add class "section" for styling
        document.getElementById("visibleQueue").appendChild(newDiv);
        ModulePointer.render(newDiv, id);
    });
    buttonDiv.appendChild(button); // add button to page
}

// Makes sure all imported modules have the values and functions they need
function checkModuleContents(Module, name) {
    if (
        typeof Module.moduleName !== "string" &&
        !(Module.moduleName instanceof String)
    ) {
        console.log("Module Name Doesn't Exist for", name);
    } else if (typeof Module.render !== "function") {
        console.log("Render() doesn't exist for", name);
    } else if (typeof Module.instance !== "function") {
        console.log("Instance() doesn't exist for", name);
    }
}

// Import all the functions from their modules and add buttons to page
window.onload = function () {
    // Load all our processing functions
    processingFunctions.forEach(function (name) {
        var path = "../jsmodules/" + name + ".js";
        console.log("- about to load: " + name + " from " + path);
        import(path).then((Module) => {
            // Makes sure module has the exports I need
            checkModuleContents(Module, name);
            console.log("Module loaded: " + Module.moduleName);

            // Adds "add function" button to page
            addButton(Module);
        });
    });

    // Add listener for changing video sample rate
    let sampleRateTextBox = document.getElementById("tempo");
    if (sampleRateTextBox) {
        sampleRateTextBox.addEventListener("input", () => {
            repeatProcess("video", "fin_dest");
        });
    } else {
        throw `Trying to get DOM of sample rate text box before page loads`;
    }

    start_video("video");
    repeatProcess("video", "fin_dest");
};

/*
 *
 * Video & Repeated Sampling Functions
 *
 */

// Function from Prof. Danahy to start streaming video (chrome only?)
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

// Takes video data and displays on a canvas, also can return frame as img
function display_frame(src_canvas_id, dst_canvas_id) {
    // source canvas
    var src_canvas = document.getElementById(src_canvas_id);

    // draw src onto dst
    // see: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
    // create output canvas context
    let dst_canvas = document.getElementById(dst_canvas_id);
    let dst_canvas_context = dst_canvas.getContext("2d");
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

// Clears, then sets interval variable with function and interval timing
function repeatProcess(src_id, dest_id) {
    // Reset Interval
    resetProcessing();

    // set size of destination:
    var dst_canvas = document.getElementById(dest_id);
    dst_canvas.setAttribute("width", output_width);
    dst_canvas.setAttribute("height", output_height);

    var tempo = document.getElementById("tempo").value;
    process = setInterval(doProcess, tempo, src_id, dest_id);
}

// Iterates through each processing step before showing final image
function doProcess(src_id, dest_id) {
    // Read image from the video stream
    var img = display_frame(src_id, dest_id);

    // For debugging generateCode
    if (test) {
        // Do predefined function on img
        console.log(processImage(img));
    } else {
        // Let user change functions applied to img
        for (let i = 0; i < functionQueue.len; i++) {
            functionQueue.function_at(i).execute(img);
        }
    }

    // Show final image
    cv.imshow(dest_id, img);
    img.delete();
}
