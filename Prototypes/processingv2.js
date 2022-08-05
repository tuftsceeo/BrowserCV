/**
 * TODO: Bugs
 * -
 *
 * TODO: Add tutorial (for each language)!
 * - Move howToLinkOpenCV to a separate tutorial page
 * - Also have explanation for setting everything up
 *
 * TODO: Change index page (should just be prototypev003)
 * - Add links back to other prototypes for now
 * - Add tutorial button (which brings up page-in-page popup?)
 *
 * TODO: Improve functionality of FunctionQueue
 * - Swap two functions
 *
 * TODO: Add more functions:
 * - Re-add findObjects
 * - Something using the radius of an object to find its size
 * - Location of object within 3x3 grid, passes back 1-9
 * - Motional detection (subtracts one frame from another)
 *
 * TODO: Add more languages
 * - python
 *
 * TODO: CSS + Design
 * - Make site look prettier
 * - improve accessibility
 * - Have canvas move as you scroll?
 * - resizable text box
 * - drag and drop?
 * - buttons generate below latest addition as well (maybe just have another div under where buttons generate at first as well)
 *
 * TODO: About page?
 *
 */

"use strict";

/*
 *
 * Global Vars and Importing Global Functions
 *
 */

// Global variables
var input_width = 320; // Size of input and output
var input_height = 240;
var output_width = 320;
var output_height = 240;
var stopVideo = false; // Video stopped by user
let cvLoaded = false; // OpenCV has loaded

// Import functions used here
let codeLine, generateCode, copyToClip;
import("../jsmodules/moduleSetup/moduleHelper.js").then((mh) => {
    codeLine = mh.codeLine;
    copyToClip = mh.copyToClip;
});
import("../jsmodules/generateCode/generateCode.js").then((gc) => {
    generateCode = gc.generateCode;
});

// Import and set up functionQueue
var functionQueue;
import("../jsmodules/functionQueue.js").then((Module) => {
    functionQueue = Module.instance();
});

// List of functions that exist to import
let processingFunctions = [
    "threshold",
    "greyscale",
    "findColor",
    "backgroundSubtract",
    "findObjects",
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
            console.log(
                `Error adding ${ModulePointer.moduleName}, functionQueue.add didn't return an ID`
            );
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

    // Start video and processing
    start_video("video");
    repeatProcess("video", "fin_dest");
};

/*
 *
 * Video & Repeated Sampling Functions
 *
 */

// Function from Prof. Danahy to start streaming video
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

// Runs video processing and displays frame
function repeatProcess(video_id, dest_id) {
    // Setup
    let video_canvas = document.getElementById(video_id);
    let cap = new cv.VideoCapture(video_canvas);
    let begin = Date.now();
    var dst_canvas = document.getElementById(dest_id);
    dst_canvas.setAttribute("width", output_width);
    dst_canvas.setAttribute("height", output_height);

    // If page loads faster than OpenCV causing error, try again
    let img;
    if (cvLoaded) {
        img = new cv.Mat(video_canvas.height, video_canvas.width, cv.CV_8UC4);
    } else {
        try {
            img = new cv.Mat(
                video_canvas.height,
                video_canvas.width,
                cv.CV_8UC4
            );
            cvLoaded = true;
        } catch (error) {
            console.log(
                `Error loading OpenCV. Trying again. Encountered: ${error}`
            );
            setTimeout(repeatProcess, 100, video_id, dest_id);
            return;
        }
    }

    try {
        // Generate this frame
        cap.read(img);

        // Run processing on frame
        doProcess(img);

        // Display frame
        cv.imshow(dest_id, img);
    } catch (error) {
        console.log(error);
    }

    // Clean Up
    img.delete();

    // Start next frame at appropriate time unless stopped
    let fps = document.getElementById("fps").value;
    let elapsed = Date.now() - begin;
    let allowedDelay = 1000 / fps;
    let delay = allowedDelay - elapsed;

    // Warn if frame took too long to generate
    if (delay < 0) {
        console.log(
            `Processing took longer than expected (${elapsed} ms > ${Number(
                allowedDelay.toFixed(1)
            )} ms). Please lower the render FPS or remove a processing function.`
        );
    }
    if (!stopVideo) {
        setTimeout(repeatProcess, delay, video_id, dest_id);
    }
}

// Iterates through each processing step before showing final image
function doProcess(img) {
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
}
