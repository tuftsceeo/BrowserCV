/**
 * TODO: Improve functionality of FunctionQueue
 * - Swap two functions
 *
 * TODO: Do all the generating code stuff
 * - function that runs through queue and calls .showCode()
 * - makes sure parameters etc. are linked up
 * - have library of functions for copy/paste?
 *
 * TODO: Add more functions:
 * - a way to find objects in scene
 *   - contours
 *   - min enclosing circles within threshold min/max
 *   - # of objects
 *   - positions of objects
 * - eventually code where user can do something if object is within an rect
 *
 */

/*
 *
 * Global Vars
 *
 */

// Set up functions
var functionQueue;
import("../jsmodules/functionqueue.js").then((Module) => {
    functionQueue = Module.instance();
});
let processingFunctions = ["threshold", "greyscale"];

function addButton(ModulePointer) {
    // destination div
    let buttonDiv = document.getElementById("buttons");
    // create new button
    let button = document.createElement("button");
    button.id = ModulePointer.moduleName;
    button.innerHTML = "Add " + ModulePointer.moduleName;
    button.addEventListener("click", () => {
        // add to functionQueue
        let id = functionQueue.add(ModulePointer);
        if (!id) {
            return;
        }
        // render element
        let newDiv = document.createElement("div");
        newDiv.id = id;
        newDiv.classList.add("section"); // add class "section" for styling
        document.getElementById("visibleQueue").appendChild(newDiv);
        ModulePointer.render(newDiv, id);
    });
    buttonDiv.appendChild(button); // add button to page
}

window.onload = function () {
    processingFunctions.forEach(function (name) {
        var path = "../jsmodules/" + name + ".js";
        console.log("- about to load: " + name + " from " + path);
        import(path).then((Module) => {
            // once module loaded, what to do with it:
            console.log("Module loaded: " + Module.moduleName);
            addButton(Module);
        });
    });
};

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
