// Module holding function which draws circles on an image

export default function drawCircles(img, circles) {
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
