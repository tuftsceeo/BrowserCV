// Function to perform threshold action on an image
// If image is greyscale, performs binary thresh, if not it will perform a threshold color by color
export function threshold(img, type, threshold, color = "red") {
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
        case "color":
            // Get individual color channels
            let rgba = new cv.MatVector();
            cv.split(img, rgba);
            let r = rgba.get(0);
            let g = rgba.get(1);
            let b = rgba.get(2);

            // Set which color is chosen
            let chosen, other1, other2;
            if (color == "red") {
                chosen = r;
                other1 = g;
                other2 = b;
            } else if (color == "blue") {
                chosen = b;
                other1 = g;
                other2 = r;
            } else {
                chosen = g;
                other1 = r;
                other2 = b;
            }

            // Setup
            let merged = new cv.MatVector();
            let test1 = new cv.Mat();
            let test2 = new cv.Mat();

            // See which pixels are threshold larger than both other1 and 2
            cv.subtract(chosen, other1, test1);
            cv.threshold(test1, test1, threshold, 255, cv.THRESH_BINARY);
            cv.subtract(chosen, other2, test2);
            cv.threshold(test2, test2, threshold, 255, cv.THRESH_BINARY);
            cv.bitwise_and(test1, test2, test1); // results go in test1

            // Place results on image
            merged.push_back(test1);
            cv.merge(merged, img);

            // Cleanup
            chosen.delete();
            other1.delete();
            other2.delete();
            test1.delete();
            test2.delete();
            rgba.delete();
            merged.delete();
            break;
        default:
            console.log("No thresh value worked");
            break;
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
    let circle_list = []; // tmp empty array for holding list

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
                circle_list.push(circle);
            }
        }

        // sort results, biggest to smallest
        // code via: https://flaviocopes.com/how-to-sort-array-of-objects-by-property-javascript/
        circle_list.sort((a, b) => (a.radius > b.radius ? -1 : 1));
    }

    // clean up
    contours.delete();
    hierarchy.delete();

    // return, from sorted list, those that match
    return circle_list.slice(0, max_objects); // return the biggest ones
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
