// Function to perform threshold action on an image
// If image is greyscale, performs binary thresh, if not it will perform a threshold color by color
export function threshold(img, color, threshold) {
    if (color == "all") {
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

// new change
// Function to perform greyscale action
export function greyscale(img) {
    cv.cvtColor(img, img, cv.COLOR_RGBA2GRAY);
    cv.cvtColor(img, img, cv.COLOR_GRAY2RGBA);
}

// Function which finds and returns max_objects number of minimum enclosing circles around contours in img_in whose radii are between min_size and max_size
export function circleObjects(img_in, max_objects, min_size, max_size) {
    // setup
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    let contour_list = []; // tmp empty array for holding list

    // find contours
    cv.findContours(
        img_in,
        contours,
        hierarchy,
        cv.RETR_CCOMP,
        cv.CHAIN_APPROX_SIMPLE
    );

    // go through contours
    if (contours.size() > 0) {
        for (let i = 0; i < contours.size(); i++) {
            // check size
            var circle = cv.minEnclosingCircle(contours.get(i));
            if (circle.radius >= min_size && circle.radius <= max_size) {
                // push object into our array
                contour_list.push(circle);
            }
        }
        // sort results, biggest to smallest
        // code via: https://flaviocopes.com/how-to-sort-array-of-objects-by-property-javascript/
        contour_list.sort((a, b) => (a.radius > b.radius ? -1 : 1));
    } else {
        // NO CONTOURS FOUND
        //console.log('NO CONTOURS FOUND');
    }

    // return, from sorted list, those that match
    return contour_list.slice(0, max_objects); // return the biggest ones
}

// Function which draws circles on an image
export function drawCircles(img, circles) {
    // Makes the image a color image so we can draw on it
    cv.cvtColor(img, img, cv.COLOR_GRAY2RGBA);

    //draws circle and center
    let yellow_color = new cv.Scalar(255, 255, 0, 255);
    circles.forEach(function (circle) {
        // Draws circle
        cv.circle(img, circle.center, circle.radius, yellow_color, 2);
        cv.circle(img, circle.center, 1, yellow_color, 1);

        // Draws radius
        let font = cv.FONT_HERSHEY_SIMPLEX;
        cv.putText(
            img,
            Math.round(circle.radius).toString(),
            {
                x: circle.center.x - circle.radius,
                y: circle.center.y + circle.radius,
            },
            font,
            0.5,
            yellow_color,
            2,
            cv.LINE_AA
        );
    });
}
