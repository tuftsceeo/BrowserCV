// Module holding function which finds and returns max_objects number of minimum enclosing circles around contours in img_in whose radii are between min_size and max_size

export default function circleObjects(img_in, max_objects, min_size, max_size) {
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
