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
// Global object to track which order functions should run in
class FunctionQueue {
    constructor() {
        this.length = 0;
        this.functions = [];
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
            return this.functions[index];
        } else {
            console.log("Please input valid index");
        }
    }

    // Add step to the function processing queue
    // Won't add greyscale twice
    add(modulePointer) {
        // Checks if greyscale is already there
        if (
            modulePointer.moduleName == "greyscale" &&
            this.includes_greyscale
        ) {
            console.log("Can't Greyscale more than once");
            return;
        }

        let id = "ID" + this.id_gen_seed;
        let temp = modulePointer.instance(id);

        this.functions[this.length] = temp;
        this.length++;
        this.id_gen_seed++;
        console.log("Added", modulePointer.moduleName);
        return id;
    }

    indexWithID(id) {
        for (let i = 0; i < this.length; i++) {
            let func = this.functions[i];
            if (func.id == id) {
                return i;
            }
        }
        console.log("No function found with id", id);
    }

    removeWithID(id) {
        let index = this.indexWithID(id);
        let temp = this.functions.splice(index, 1)[0];
        this.length--;
        if (temp.name == "greyscale") {
            this.includes_greyscale = false;
        }
        let divToRemove = document.getElementById(id);
        divToRemove.remove();
        console.log("removed", temp["name"]);
    }

    // Takes last function off queue and returns a copy of it
    pop() {
        // Creates deep copy
        let temp = this.functions.pop();
        this.length--;
        if (temp.name == "greyscale") {
            this.includes_greyscale = false;
        }
        return temp;
    }

    // Removes step from function processing queue
    removeStep() {
        if (this.len > 0) {
            let temp = this.pop();
            let divToRemove = document.getElementById(temp["id"]);
            divToRemove.remove();
            console.log("Removed:", temp["name"]);
        }
    }

    // Returns the function with the given ID
    functionWithID(id) {
        for (let i = 0; i < this.length; i++) {
            let func = this.functions[i];
            if (func.id == id) {
                return func;
            }
        }
        console.log("No function found with id", id);
    }
}

/*
 *
 * Global Vars
 *
 */

// Set up functions
let functionQueue = new FunctionQueue();
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
