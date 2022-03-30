// Global object to track which order functions should run in
let functionQueue = {
    numFunctions: 0,
    functions: [],
};

// global variables to hold the SIZE of the input
var input_width = 320;
var input_height = 240;

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

// global variables to hold the SIZE of the output
var output_width = 320;
var output_height = 240;

// takes video data and displays on a canvas
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
//Holds repeated processing
var process;

function resetProcessing() {
    clearInterval(process);
}

function repeatProcess(src_id, dest_id) {
    resetProcessing();
    var tempo = document.getElementById("tempo").value;
    process = setInterval(doProcess, tempo, src_id, dest_id);
}

function doProcess(src_id, dest_id) {
    // Read image from the video stream
    var img = display_frame(src_id, dest_id);

    // Series of if statements that further process the image
    // if (document.getElementById('threshold').checked == true) {
    //     cv.threshold(img, img, 128, 255, cv.THRESH_BINARY);
    // }

    // Show final image
    cv.imshow(dest_id, img);
    img.delete();
}
