// Function to perform threshold action on an image
// If image is greyscale, performs binary thresh, if not it will perform a threshold color by color
export function threshold(img, color, type, threshold) {
    // Make sure it's not read as a string
    threshold = Number(threshold);

    // Thresh
    switch (type) {
        case "binary":
            cv.threshold(img, img, threshold, 255, cv.THRESH_BINARY);
            break;
        case "adaptive":
            cv.cvtColor(img, img, cv.COLOR_BGRA2GRAY);
            cv.adaptiveThreshold(
                img,
                img,
                255,
                cv.ADAPTIVE_THRESH_GAUSSIAN_C,
                cv.THRESH_BINARY,
                11,
                threshold
            );
            cv.cvtColor(img, img, cv.COLOR_GRAY2BGRA);
            break;
        case "truncate":
            cv.threshold(img, img, threshold, 255, cv.THRESH_TRUNC);
            break;
        case "to zero":
            cv.threshold(img, img, threshold, 255, cv.THRESH_TOZERO);
            break;
        default:
            console.log("No thresh value worked");
            break;
    }

    // Keep only r, g, or b channel of image if that's the color picked
    if (!(color == "all")) {
        let rgba = new cv.MatVector();
        let merged = new cv.MatVector();
        cv.split(img, rgba);
        if (color == "red") {
            merged.push_back(rgba.get(0));
        } else if (color == "green") {
            merged.push_back(rgba.get(1));
        } else if (color == "blue") {
            merged.push_back(rgba.get(2));
        }

        cv.merge(merged, img);
        rgba.delete();
        merged.delete();
    }
}

// Function to perform greyscale action
export function greyscale(img) {
    cv.cvtColor(img, img, cv.COLOR_BGRA2GRAY);
    cv.cvtColor(img, img, cv.COLOR_GRAY2BGRA);
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
    }

    // clean up
    contours.delete();
    hierarchy.delete();

    // return, from sorted list, those that match
    return contour_list.slice(0, max_objects); // return the biggest ones
}

// Function which draws circles on an image
export function drawCircles(img, circles) {
    // Makes the image a color image so we can draw on it
    cv.cvtColor(img, img, cv.COLOR_GRAY2BGRA);

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
