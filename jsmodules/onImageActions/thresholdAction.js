// Module holding function to perform threshold action

export default function threshold(img, color, threshold) {
    if (color == "all" || functionQueue.includes_greyscale) {
        // Test with adaptive thresholding
        // cv.adaptiveThreshold(
        //     img,
        //     img,
        //     255,
        //     cv.ADAPTIVE_THRESH_GAUSSIAN_C,
        //     cv.THRESH_BINARY,
        //     11,
        //     threshold
        // );
        // use cv.THRESH_TOZERO to keep image normal but set dim pixels to be black
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
