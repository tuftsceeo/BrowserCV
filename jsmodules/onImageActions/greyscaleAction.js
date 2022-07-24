// Module holding function to perform greyscale action

export default function greyscale(img) {
    cv.cvtColor(img, img, cv.COLOR_RGBA2GRAY);
}
