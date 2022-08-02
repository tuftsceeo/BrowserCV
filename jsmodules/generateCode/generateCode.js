// Module holding functions and helpers for generating code for the user

// Imports:
import * as mh from "../moduleSetup/moduleHelper.js"; // if needed

// Generate code for user
export function generateCode(functionQueue, dest_id) {
    // Setup
    const dest = document.getElementById(dest_id);
    const language = document.getElementById("generateCodeLanguage").value;
    let code = "";

    // Tell how to get OpenCV
    code += howToLinkOpenCV(language);

    // Get code and which helper functions are used from each function in functionQueue
    let returnedFromFunctions = getFunctionCode(language, functionQueue);
    let toInsert = returnedFromFunctions.toInsert;
    let allHelperNames = returnedFromFunctions.allHelperNames;

    // Add helper functions
    if (allHelperNames.length > 0) {
        code += insertHelperFuncs(language, allHelperNames);
    }

    // Insert each function's code into one big function
    code += makeFunction(language, toInsert);

    // Write code on page
    dest.value = code;
}

// Helper function for generateCode()
// Queries each function in functionQueue to have it generate its own code
// Also records which helper functions are used
// Returns object with code from each function to insert and names of all helper functions
function getFunctionCode(language, functionQueue) {
    // Setup
    let toInsert = "";
    let allHelperNames = [];

    // Iterate through functionQueue getting code for each function
    functionQueue.funcs.forEach(function (func) {
        // Announcements
        console.log(`Writing code for ${func.id}: ${func.name}`);
        toInsert += "\n";
        if (language == "JavaScript") {
            toInsert += mh.codeLine(
                `// Code for function: ${func.name} ID: ${func.id}`
            );
        } else {
            // TODO: Add support for more languages
            throw `ERROR: language: ${language} not supported yet`;
        }

        // Have function generate it's own code
        let fromFunc = func.generateCode(language);
        toInsert += fromFunc.code;

        // Check for common helper functions
        if (fromFunc.helperNames) {
            fromFunc.helperNames.forEach(function (helperName) {
                if (allHelperNames.indexOf(helperName) == -1) {
                    allHelperNames.push(helperName);
                }
            });
        }
    });

    return { toInsert: toInsert, allHelperNames: allHelperNames };
}

// Helper function for generateCode()
// Returns comment explaining how to link OpenCV functions
function howToLinkOpenCV(language) {
    if (language == "JavaScript") {
        return `// Needs accompanying HTML to function:
/*<script
\ttype="text/javascript"
\tsrc="https://docs.opencv.org/master/opencv.js"
></script>*/ \n\n`;
    } else {
        // TODO: Add support for more languages
        throw `ERROR: language: ${language} not supported yet`;
    }
}

// Helper function for generateCode()
// Returns code for all helper functions
function insertHelperFuncs(language, allHelperNames) {
    // Setup
    let code = "";
    let helperFuncLookup = {
        threshold: thresholdHelper,
        greyscale: greyscaleHelper,
        circleObjects: circleObjectsHelper,
        drawCircles: drawCirclesHelper,
    };

    // Add helper functions in allHelperNames
    if (language == "JavaScript") {
        code += "// --- Some Helper Functions -- \n";
        allHelperNames.forEach((helperName) => {
            if (helperName in helperFuncLookup) {
                code += helperFuncLookup[helperName](language);
                code += "\n";
            } else {
                throw `ERROR: no case for helperName: ${helperName}`;
            }
        });
    } else {
        // TODO: Add functionality for more languages
        throw `ERROR: Language ${language} is not supported yet`;
    }

    return code;
}

// Returns the code for the helper function for threshold
// Helper function for insertHelperFuncs
function thresholdHelper(language) {
    // Setup
    let code = "";

    if (language == "JavaScript") {
        code += "// Threshold helper function \n";
        code += "function thresholdHelper(img, color, type, threshold) { \n";
        let lines = [
            `// Make sure it's not read as a string`,
            `threshold = Number(threshold);`,
            ``,
            `// Thresh`,
            `switch (type) {`,
            `\tcase "binary":`,
            `\t\tcv.threshold(img, img, threshold, 255, cv.THRESH_BINARY);`,
            `\t\tbreak;`,
            `\tcase "adaptive":`,
            `\t\tcv.cvtColor(img, img, cv.COLOR_BGRA2GRAY);`,
            `\t\tcv.adaptiveThreshold(`,
            `\t\t\timg,`,
            `\t\t\timg,`,
            `\t\t\t255,`,
            `\t\t\tcv.ADAPTIVE_THRESH_GAUSSIAN_C,`,
            `\t\t\tcv.THRESH_BINARY,`,
            `\t\t\t11,`,
            `\t\t\tthreshold`,
            `\t\t);`,
            `\t\tcv.cvtColor(img, img, cv.COLOR_GRAY2BGRA);`,
            `\t\tbreak;`,
            `\tcase "truncate":`,
            `\t\tcv.threshold(img, img, threshold, 255, cv.THRESH_TRUNC);`,
            `\t\tbreak;`,
            `\tcase "to zero":`,
            `\t\tcv.threshold(img, img, threshold, 255, cv.THRESH_TOZERO);`,
            `\t\tbreak;`,
            `\tdefault:`,
            `\t\tconsole.log("No thresh value worked");`,
            `\t\tbreak;`,
            `}`,
            ``,
            `// Keep only r, g, or b channel of image if that's the color picked`,
            `if (!(color == "all")) {`,
            `\tlet rgba = new cv.MatVector();`,
            `\tlet merged = new cv.MatVector();`,
            `\tcv.split(img, rgba);`,
            `\tif (color == "red") {`,
            `\t\tmerged.push_back(rgba.get(0));`,
            `\t} else if (color == "green") {`,
            `\t\tmerged.push_back(rgba.get(1));`,
            `\t} else if (color == "blue") {`,
            `\t\tmerged.push_back(rgba.get(2));`,
            `\t}`,
            ``,
            `\tcv.merge(merged, img);`,
            `\trgba.delete();`,
            `\tmerged.delete();`,
        ];
        lines.forEach(function (line) {
            code += mh.codeLine(line);
        });
        code += mh.codeLine("}");
        code += "} \n";
    } else {
        // TODO: Add functionality for more languages
        throw `ERROR: Language ${language} is not supported yet`;
    }

    return code;
}

// Returns the code for the helper function for greyscale
// Helper function for insertHelperFuncs
function greyscaleHelper(language) {
    // Setup
    let code = "";

    if (language == "JavaScript") {
        code += "// Greyscale helper function\n";
        code += "function greyscaleHelper(img) {\n";
        code += codeLine(`cv.cvtColor(img, img, cv.COLOR_BGRA2GRAY);`);
        code += codeLine("cv.cvtColor(img, img, cv.COLOR_GRAY2BGRA);");
        code += "}\n";
    } else {
        // TODO: Add functionality for more languages
        throw `ERROR: Language ${language} is not supported yet`;
    }

    return code;
}

// Returns the code for the helper function for circle objects
// Helper function for insertHelperFuncs
function circleObjectsHelper(language) {
    // Setup
    let code = "";

    if (language == "JavaScript") {
        code += "// Circle objects helper function \n";
        code += `function circleObjectsHelper(img_in, max_objects, min_size, max_size) {
\t// setup
\tlet contours = new cv.MatVector();
\tlet hierarchy = new cv.Mat();
\tlet contour_list = []; // tmp empty array for holding list
        
\t// find contours
\tcv.findContours(
\t\timg_in,
\t\tcontours,
\t\thierarchy,
\t\tcv.RETR_CCOMP,
\t\tcv.CHAIN_APPROX_SIMPLE
\t);
        
\t// go through contours
\tif (contours.size() > 0) {
\t\tfor (let i = 0; i < contours.size(); i++) {
\t\t\t// check size
\t\t\tvar circle = cv.minEnclosingCircle(contours.get(i));
\t\t\tif (circle.radius >= min_size && circle.radius <= max_size) {
\t\t\t\t// push object into our array
\t\t\t\tcontour_list.push(circle);
\t\t\t}
\t\t}

\t\t// sort results, biggest to smallest
\t\t// code via: https://flaviocopes.com/how-to-sort-array-of-objects-by-property-javascript/
\t\tcontour_list.sort((a, b) => (a.radius > b.radius ? -1 : 1));
\t}

\t// clean up
\tcontours.delete();
\thierarchy.delete();
        
\t// return, from sorted list, those that match
\treturn contour_list.slice(0, max_objects); // return the biggest ones
}\n`;
    } else {
        // TODO: Add functionality for more languages
        throw `ERROR: Language ${language} is not supported yet`;
    }

    return code;
}

// Returns the code for the helper function for draw circles
// Helper function for insertHelperFuncs
function drawCirclesHelper(language) {
    // Setup
    let code = "";

    if (language == "JavaScript") {
        code += "// Draw circles helper function \n";
        code += `function drawCirclesHelper(img, circles) {
\t// Makes the image a color image so we can draw on it
\tcv.cvtColor(img, img, cv.COLOR_GRAY2BGRA);
        
\t//draws circle and center
\tlet yellow_color = new cv.Scalar(255, 255, 0, 255);
\tcircles.forEach(function (circle) {
\t\t// Draws circle
\t\tcv.circle(img, circle.center, circle.radius, yellow_color, 2);
\t\t cv.circle(img, circle.center, 1, yellow_color, 1);

\t\t// Draws radius
\t\tlet font = cv.FONT_HERSHEY_SIMPLEX;
\t\tcv.putText(
\t\t\timg,
\t\t\tMath.round(circle.radius).toString(),
\t\t\t{
\t\t\t\tx: circle.center.x - circle.radius,
\t\t\t\ty: circle.center.y + circle.radius,
\t\t\t},
\t\t\tfont,
\t\t\t0.5,
\t\t\tyellow_color,
\t\t\t2,
\t\t\tcv.LINE_AA
\t\t);
\t});
}\n`;
    } else {
        // TODO: Add functionality for more languages
        throw `ERROR: Language ${language} is not supported yet`;
    }

    return code;
}

// Helper function for generateCode()
// Returns code for overall image processing function
function makeFunction(language, toInsert) {
    let code = "";

    if (language == "JavaScript") {
        code += `// Takes in variable containing openCV image and modifies it
// Returns any function outputs (such as coordinates of objects)
function processImage(img) { 
\t// Setup
\tlet outputs = {}; 
${toInsert}
\t// Return outputs of sub functions
\treturn outputs;
}`;
    } else {
        // TODO: Add functionality for more languages
        throw `ERROR: Language ${language} is not supported yet`;
    }

    return code;
}
