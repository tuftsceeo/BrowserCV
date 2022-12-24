/**
 * TODO: Bugs
 * - onImageActions.circleObjects makes the image black and white. Should deep
 *   copy the image, then make the copy black and white, then do actions, then
 *   return the circles, not modify original image (JS only)
 *
 * TODO: Improve Help with example tutorials
 * - For example certain combinations of functions that do:
 *      - Detect if object is in L or R using is object in grid
 *          - Using either 0.1 and 1.1 or 2 functions
 *      - Detect where object is in 3x3 using 1-9
 *      - etc.
 *
 * TODO: Add more functions:
 * - Something using the radius of an object to find its size
 * - Erase everything outside/inside object circles (using mask)
 *
 * TODO: Add more languages
 * - python (+ tutorial)
 *
 * TODO: CSS + Design
 * - improve accessibility
 * - Have canvas move as you scroll?
 * - resizable text box?
 * - drag and drop?
 * - Make mobile hamburger thing work in navbar
 *
 * TODO: About page?
 * - Privacy policy (just saying we don't collect data?)
 * - License? (MIT? Apache?)
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
const processingFunctions = {
    threshold: {
        fileName: "threshold",
        order: 2,
        buttonColor: `btn-outline-dark`,
    },
    greyscale: {
        fileName: "greyscale",
        order: 1,
        buttonColor: `btn-outline-dark`,
    },
    "find color": {
        fileName: "findColor",
        order: 5,
        buttonColor: `btn-primary`,
    },
    "subtract background": {
        fileName: "backgroundSubtract",
        order: 3,
        buttonColor: `btn-outline-dark`,
    },
    "find objects": {
        fileName: "findObjects",
        order: 4,
        buttonColor: `btn-primary`,
    },
    "is object in grid": {
        fileName: "objectInGrid",
        order: 6,
        buttonColor: `btn-outline-success`,
    },
};

// Used in internal testing of the generateCode function
let test = false;
let processImage;

/*
 *
 * Page Setup
 *
 */

// Generates button on page for a given function module
function addButton(ModulePointer) {
    // Setup
    const name = ModulePointer.moduleName;
    console.log(`Name: ${name}`);
    const topButtonDiv = document.getElementById("topButtons");

    // create new button
    let button = document.createElement("button");
    button.innerHTML = "Add " + name;
    styleButton(button, name);
    let copyOfButton = button.cloneNode(true);

    // Adds function to functionQueue when clicked & generates interface
    button.addEventListener("click", () => {
        // add to functionQueue
        let id = functionQueue.add(ModulePointer);
        if (!id) {
            console.log(
                `Error adding ${name}, functionQueue.add didn't return an ID`
            );
        }
        ModulePointer.render("visibleQueue", id);
    });
    copyOfButton.addEventListener("click", () => {
        // add to functionQueue
        let id = functionQueue.add(ModulePointer);
        if (!id) {
            console.log(
                `Error adding ${name}, functionQueue.add didn't return an ID`
            );
        }
        // render interface
        ModulePointer.render("visibleQueue", id);
    });

    // Create columns to hold buttons
    const column = document.createElement("div");
    column.classList.add("col");
    column.classList.add("btn-col");
    addOrder(column, name);
    const copyOfColumn = column.cloneNode(true);
    column.appendChild(button);
    copyOfColumn.appendChild(copyOfButton);

    // Put buttons on page
    topButtonDiv.appendChild(column);
}

// Helper function for addButton
// Adds bootstrap styling to button
function styleButton(button, name) {
    button.classList.add(`btn`);
    button.classList.add(processingFunctions[name].buttonColor);
}

// Helper function for addButton
// Adds horizontal ordering (via order class) to columns for buttons
function addOrder(column, name) {
    const orderStyle = `order: ${processingFunctions[name].order}!important;`;
    column.style.cssText += orderStyle;
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
    for (const property in processingFunctions) {
        const name = processingFunctions[property].fileName;
        const path = "../jsmodules/" + name + ".js";
        console.log("- about to load: " + name + " from " + path);
        import(path).then((Module) => {
            // Makes sure module has the exports I need
            checkModuleContents(Module, name);
            console.log("Module loaded: " + Module.moduleName);

            // Adds "add function" button to page
            addButton(Module);
        });
    }

    // Start video and processing
    start_video("video");
    repeatProcess("video", "fin_dest");
};

/*
 *
 * UI
 *
 */

function toggleInterfaceMinimize(id) {
    const body = document.getElementById(id + `interfaceBody`);
    const button = document.getElementById(id + `toggleMinimize`);
    if (button.innerHTML.includes("-")) {
        body.style.display = "none";
        button.innerHTML = "+";
    } else {
        body.style.display = "block";
        button.innerHTML = "-";
    }
}

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
        handleError(error);
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
    // For debugging
    // Make a copy of img and apply generateCode's function to it
    let testImage;
    if (test) {
        testImage = img.clone();
        const outputs = processImage(testImage);
        console.log(outputs);
    }

    // Apply currently defined functions to img
    for (let i = 0; i < functionQueue.len; i++) {
        functionQueue.function_at(i).execute(img);
    }

    // For debugging
    // See if the two functions produce the same result
    if (test) {
        // Show images in debug area
        cv.imshow("test1", img);
        cv.imshow("test2", testImage);

        let message = "Images are ";
        const similar = areSameImg(img, testImage);
        const same = similar.areSame;
        if (same) {
            message = "eqiuvalent ✔️";
        } else {
            message = `NOT equivalent ❌ - ${similar.count} differences`;
        }
        console.log(message);

        // Clean up
        testImage.delete();
    }
}

/*
 *
 * Debugging
 *
 */

// Function for testing code generated from generateCode
function testCode() {
    // Setup
    test = !test;
    let button = document.getElementById("testCode");
    let fps = document.getElementById("fps");
    let testImgArea = document.getElementById("showTestImgs");
    if (test) {
        button.innerHTML = "Stop"; // Change button
        fps.value = 1; // Lower FPS

        // Generate code and run it
        let code = generateCode(functionQueue, "output_code", test);
        console.log(code);
        eval(code); // !Remove for working release

        // Create 2 canvasses on page to compare images visually
        let canvas1 = document.createElement("canvas");
        let canvas2 = document.createElement("canvas");
        canvas1.id = "test1";
        canvas2.id = "test2";
        testImgArea.appendChild(canvas1);
        testImgArea.appendChild(canvas2);
    } else {
        button.innerHTML = "Test"; // Reset button
        fps.value = 15; // Reset FPS

        // Remove canvasses
        let canvas1 = document.getElementById("test1");
        let canvas2 = document.getElementById("test2");
        testImgArea.removeChild(canvas1);
        testImgArea.removeChild(canvas2);
    }
}

// Function that checks if two images are the same
function areSameImg(img1, img2) {
    let areSame = true;

    // Check if images are same size
    if (img1.data.length != img2.data.length) {
        areSame = false;
    }

    let count = 0;
    // Check if any element are different
    for (let i = 0; i < img1.data.length; i++) {
        if (img1.data[i] != img2.data[i]) {
            areSame = false;
            count++;
        }
    }

    // Must be the same
    return { areSame, count };
}

// Get more info from openCV errors
// Via https://docs.opencv.org/4.x/utils.js
function handleError(error) {
    if (typeof error === "undefined") {
        error = "";
    } else if (typeof error === "number") {
        if (!isNaN(error)) {
            if (typeof cv !== "undefined") {
                error = "Exception: " + cv.exceptionFromPtr(error).msg;
            }
        }
    } else if (typeof error === "string") {
        let ptr = Number(error.split(" ")[0]);
        if (!isNaN(ptr)) {
            if (typeof cv !== "undefined") {
                error = "Exception: " + cv.exceptionFromPtr(ptr).msg;
            }
        }
    } else if (error instanceof Error) {
        error = error.stack.replace(/\n/g, "<br>");
    }
    console.log(error);
}
