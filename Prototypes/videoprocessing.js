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

// Template for all of our functions
class CvFunction {
    constructor(name, id, params, outputs, chngimg) {
        this.name = name;
        this.id = id;
        this.params = params;
        this.outputs = outputs;
        // Boolean value if the function changes the image or not
        this.chngimg = chngimg;
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
    add(name, params, outputs, chngimg) {
        if (name != "greyscale") {
            let temp = new CvFunction(
                name,
                "ID" + this.id_gen_seed,
                params,
                outputs,
                chngimg
            );
            this.functions["func" + this.length] = temp;
            this.length++;
            this.id_gen_seed++;
            console.log("Added", name);
        } else if (!functionQueue.includes_greyscale) {
            this.functions["func" + this.length] = greyscale;
            this.length++;
            this.id_gen_seed++;
            this.includes_greyscale = true;
            console.log("Added", greyscale["name"]);
        }
    }

    // Takes last function off queue and returns a copy of it
    pop() {
        // Creates deep copy
        let temp = JSON.parse(
            JSON.stringify(this.functions["func" + (this.length - 1)])
        );
        delete this.functions["func" + (this.length - 1)];
        this.length--;
        return temp;
    }
}

let functionQueue = new FunctionQueue();

// Global unique greyscale function because we can only have one
let greyscale = new CvFunction("greyscale", "IDgreyscale", [], [], true);

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

/*
 *
 * Video Processing Functions
 *
 */

// Iterates through each processing step before showing final image
function doProcess(src_id, dest_id) {
    // Read image from the video stream
    var img = display_frame(src_id, dest_id);

    for (let i = 0; i < functionQueue.len; i++) {
        doProcessingStep(functionQueue.function_at(i), img);
    }

    // Show final image
    cv.imshow(dest_id, img);
    img.delete();
}

// Removes step from function processing queue
function removeStep() {
    if (functionQueue.len > 0) {
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
