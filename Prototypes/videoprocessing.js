/**
 * TODO: Show function queue on HTML page
 * - set innerHTML to show what's in the function queue object
 *
 * TODO: Do all the generating code stuff
 * - function that generates applies processing in order user queues
 * - function returns what it's supposed to
 * - et cetera
 *
 * TODO: Add more functions:
 * - a threshold you can choose color & value with a slider
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

// Global object to track which order functions should run in
let functionQueue = [];

// Global unique greyscale function because we can only have one
let greyscale = { name: "greyscale", parameters: [] };

// global variables to hold the SIZE of the input
var input_width = 320;
var input_height = 240;

// global variables to hold the SIZE of the output
var output_width = 320;
var output_height = 240;

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

    for (let i = 0; i < functionQueue.length; i++) {
        doProcessingStep(functionQueue[i], img);
    }

    // Show final image
    cv.imshow(dest_id, img);
    img.delete();
}

// Add step to the function processing queue
// Won't add greyscale twice
function addStep(funcObject) {
    if (funcObject["name"] != "greyscale") {
        functionQueue.push(funcObject);
        console.log("Added", funcObject["name"]);
    } else if (!functionQueue.includes(greyscale)) {
        functionQueue.push(greyscale);
        console.log("Added", greyscale["name"]);
    }
}

// Removes step from function processing queue
function removeStep() {
    if (functionQueue.length > 0) {
        console.log("Removed:", functionQueue.pop()["name"]);
    }
}

// Finds the right processing step and executes it
function doProcessingStep(funcObject, img) {
    funcName = funcObject["name"];
    switch (funcName) {
        case "threshold":
            cv.threshold(img, img, 128, 255, cv.THRESH_BINARY);
            break;
        case "greyscale":
            cv.cvtColor(img, img, cv.COLOR_RGBA2GRAY);
            break;
    }
}
