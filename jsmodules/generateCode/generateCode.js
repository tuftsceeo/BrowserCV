// Module holding functions and helpers for generating code for the user

// Imports:
import * as mh from "../moduleSetup/moduleHelper.js"; // if needed

// Generate code for user
export function generateCode(functionQueue, dest_id, test = false) {
    // Setup
    const dest = document.getElementById(dest_id);
    const language = document.getElementById("generateCodeLanguage").value;
    let code = "";

    // Get code and which helper functions are used from each function in functionQueue
    let returnedFromFunctions = getFunctionCode(language, functionQueue);
    let toInsert = returnedFromFunctions.toInsert;
    let allHelperNames = returnedFromFunctions.allHelperNames;

    // Add helper functions
    if (allHelperNames.length > 0) {
        code += insertHelperFuncs(language, allHelperNames);
    }

    // Insert each function's code into one big function
    code += makeFunction(language, toInsert, test);

    // For debugging
    if (test) {
        return code;
    } else {
        // Write code on page
        dest.innerHTML = code;
    }
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
        // Announce which function
        console.log(`Writing code for ${func.id}: ${func.name}`);
        toInsert += mh.codeLine(
            codeComment(
                language,
                `Code for function: ${func.name} ID: ${func.id}`
            )
        );

        // Have function generate it's own code
        let fromFunc = func.generateCode(language);
        toInsert += fromFunc.code;

        // Check for common helper functions
        if (fromFunc.helperNames) {
            fromFunc.helperNames.forEach(function (helperName) {
                 // Check if we have the helper already. A -1 return value
                 // means we don't
                if (allHelperNames.indexOf(helperName) == -1) {
                    allHelperNames.push(helperName);
                }
            });
        }
    });

    return { toInsert: toInsert, allHelperNames: allHelperNames };
}

// Helper function for generateCode()
// Returns code for all helper functions
function insertHelperFuncs(language, allHelperNames) {
    // Setup
    let code = codeComment(language, `--- Some Helper Functions --- \n`);
    let helperFuncLookup = {
        threshold: thresholdHelper,
        greyscale: greyscaleHelper,
        circleObjects: circleObjectsHelper,
        drawCircles: drawCirclesHelper,
        backgroundSubtract: backgroundSubtractHelper,
        font: fontHelper,
        green: greenHelper,
    };

    // Add helper functions
    allHelperNames.forEach((helperName) => {
        if (helperName in helperFuncLookup) {
            code += helperFuncLookup[helperName](language);
            code += "\n";
        } else {
            throw `ERROR: no case for helperName: ${helperName}`;
        }
    });

    return code;
}

// Returns the code for the helper function for threshold
// Helper function for insertHelperFuncs
function thresholdHelper(language) {
    // Setup
    let code = codeComment(language, "Threshold helper function \n");

    if (language == "JavaScript") {
        code +=
            "function thresholdHelper(img, type, threshold, color = 'red') { \n";
        let lines = [
            `// Make sure it's not read as a string`,
            `threshold = Number(threshold);`,
            ``,
            `// Thresh`,
            `switch (type) {`,
            `    case "binary":`,
            `        cv.threshold(img, img, threshold, 255, cv.THRESH_BINARY);`,
            `        break;`,
            `    case "adaptive":`,
            `        cv.cvtColor(img, img, cv.COLOR_BGRA2GRAY);`,
            `        cv.adaptiveThreshold(`,
            `            img,`,
            `            img,`,
            `            255,`,
            `            cv.ADAPTIVE_THRESH_GAUSSIAN_C,`,
            `            cv.THRESH_BINARY,`,
            `            11,`,
            `            threshold`,
            `        );`,
            `        cv.cvtColor(img, img, cv.COLOR_GRAY2BGRA);`,
            `        break;`,
            `    case "truncate":`,
            `        cv.threshold(img, img, threshold, 255, cv.THRESH_TRUNC);`,
            `        break;`,
            `    case "to zero":`,
            `        cv.threshold(img, img, threshold, 255, cv.THRESH_TOZERO);`,
            `        break;`,
            '    case "color":',
            `        // Get individual color channels`,
            `        let rgba = new cv.MatVector();`,
            `        cv.split(img, rgba);`,
            `        let r = rgba.get(0);`,
            `        let g = rgba.get(1);`,
            `        let b = rgba.get(2);`,
            ``,
            `        // Set which color is chosen`,
            `        let chosen, other1, other2;`,
            `        if (color == "red") {`,
            `            chosen = r;`,
            `            other1 = g;`,
            `            other2 = b;`,
            `        } else if (color == "blue") {`,
            `            chosen = b;`,
            `            other1 = g;`,
            `            other2 = r;`,
            `        } else {`,
            `            chosen = g;`,
            `            other1 = r;`,
            `            other2 = b;`,
            `        }`,
            ``,
            `        // Setup`,
            `        let merged = new cv.MatVector();`,
            `        let test1 = new cv.Mat();`,
            `        let test2 = new cv.Mat();`,
            ``,
            `        // See which pixels are threshold larger than both other1 and 2`,
            `        cv.subtract(chosen, other1, test1);`,
            `        cv.threshold(test1, test1, threshold, 255, cv.THRESH_BINARY);`,
            `        cv.subtract(chosen, other2, test2);`,
            `        cv.threshold(test2, test2, threshold, 255, cv.THRESH_BINARY);`,
            `        cv.bitwise_and(test1, test2, test1); // results go in test1`,
            ``,
            `        // Place results on image`,
            `        merged.push_back(test1);`,
            `        cv.merge(merged, img);`,
            ``,
            `        // Cleanup`,
            `        chosen.delete();`,
            `        other1.delete();`,
            `        other2.delete();`,
            `        test1.delete();`,
            `        test2.delete();`,
            `        rgba.delete();`,
            `        merged.delete();`,
            ``,
            `        // Restore image back to color`,
            `        cv.cvtColor(img, img, cv.COLOR_GRAY2BGRA);`,
            ``,
            `        break;`,
            `    default:`,
            `        console.log("No thresh value worked");`,
            `        break;`,
            `}`,
        ];
        lines.forEach(function (line) {
            code += mh.codeLine(line);
        });
        code += "} \n";
    } else if (language == "Python") {
        code += "def thresholdHelper(img, Type, threshold, color = 'red'):\n";
        code += `   # Make sure threshold isn't read as a string
    threshold = float(threshold)

    # Thresh
    if (Type == "binary"):
        ret, img = cv.threshold(img, threshold, 255, cv.THRESH_BINARY)
    elif (Type == "adaptive"):
        img = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
        ret, img = cv.adaptiveThreshold(img, 255,cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 11, threshold)
        img = cv.cvtColor(img, cv.COLOR_GRAY2BGR)
    elif (Type == "truncate"):
        ret, img = cv.threshold(img, threshold, 255, cv.THRESH_TRUNC)
    elif (Type == "to zero"):
        ret, img = cv.threshold(img, threshold, 255, cv.THRESH_TOZERO)
    elif (Type == "color"):
        # Setup
        b, g, r = cv.split(img)
        if (color == 'red'):
            chosen = r
            other1 = g
            other2 = b
        elif (color == "blue"):
            chosen = b
            other1 = g
            other2 = r
        else:
            chosen = g
            other1 = r
            other2 = b
            
        # See which pixels are threshold larger than both other1 and 2
        test1 = cv.subtract(chosen, other1)
        ret, test1 = cv.threshold(test1, threshold, 255, cv.THRESH_BINARY)
        test2 = cv.subtract(chosen, other2)
        ret, test2 = cv.threshold(test2, threshold, 255, cv.THRESH_BINARY)
        img = cv.bitwise_and(test1, test2)
        
        # Restore image back to color for compatibility
        img = cv.cvtColor(img, cv.COLOR_GRAY2BGRA)
    else:
        print("No thresh type worked")

    return img\n`;
    } else {
        throw `ERROR: Language ${language} is not supported yet`;
    }

    return code;
}

// Returns the code for the helper function for greyscale
// Helper function for insertHelperFuncs
function greyscaleHelper(language) {
    // Setup
    let code = codeComment(language, "Greyscale helper function\n");

    if (language == "JavaScript") {
        code += "function greyscaleHelper(img) {\n";
        code += mh.codeLine(`cv.cvtColor(img, img, cv.COLOR_BGRA2GRAY);`);
        code += mh.codeLine("cv.cvtColor(img, img, cv.COLOR_GRAY2BGRA);");
        code += "}\n";
    } else if (language == "Python") {
        code += "def greyscaleHelper(img):\n";
        code += mh.codeLine("img = cv.cvtColor(img, cv.COLOR_BGR2GRAY)");
        code += mh.codeLine(`return cv.cvtColor(img, cv.COLOR_GRAY2BGR)`);
    } else {
        throw `ERROR: Language ${language} is not supported yet`;
    }

    return code;
}

// Returns code defining font for objectInGrid
// Helper function for insertHelperFuncs
function fontHelper(language) {
    // Setup
    let code = codeComment(language, "Define font\n");

    if (language == "JavaScript") {
        code += "const font = cv.FONT_HERSHEY_SIMPLEX;\n";
    } else if (language == "Python") {
        code += "font = cv.FONT_HERSHEY_SIMPLEX\n";
    } else {
        throw `ERROR: Language ${language} is not supported yet`;
    }

    return code;
}

// Returns code defining green for objectInGrid
// Helper function for insertHelperFuncs
function greenHelper(language) {
    // Setup
    let code = codeComment(language, "Define green\n");

    if (language == "JavaScript") {
        code += "const green = new cv.Scalar(0, 255, 0, 255);\n";
    } else if (language == "Python") {
        code += "green = (0, 255, 0)\n";
    } else {
        throw `ERROR: Language ${language} is not supported yet`;
    }

    return code;
}

// Returns the code for the helper function for backgroundSubtract
// Helper function for insertHelperFuncs
function backgroundSubtractHelper(language) {
    // Setup
    let code = codeComment(language, "Subtract Background helper\n");
    code += codeComment(
        language,
        "This fgbg (foreground background) object needs to exist\n"
    );
    code += codeComment(
        language,
        "through multiple frames - so it gets defined outside of\n"
    );
    code += codeComment(language, "the process function\n");

    if (language == "JavaScript") {
        code += "// WARNING: run fgbg.delete() at the end of your program\n";
        code += "// to avoid leaking memory\n";
        code += `try {
    fgbg.delete()
} catch (error) {
    // Do nothing
}\n`;
        code += "var fgbg = new cv.BackgroundSubtractorMOG2(500, 16, true);\n";
    } else if (language == "Python") {
        code += "fgbg = createBackgroundSubtractorMOG2(500, 16, True)\n";
    } else {
        throw `ERROR: Language ${language} is not supported yet`;
    }

    return code;
}

// Returns the code for the helper function for circle objects
// Helper function for insertHelperFuncs
function circleObjectsHelper(language) {
    // Setup
    let code = codeComment(language, "Circle objects helper function\n");

    if (language == "JavaScript") {
        code += `function circleObjectsHelper(img, max_objects, min_size, max_size) {
    // Setup
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    let circle_list = []; // tmp empty array for holding list

    // Make image greyscale (to prevent errors)
    cv.cvtColor(img, img, cv.COLOR_RGBA2GRAY);

    // Find contours
    cv.findContours(
        img,
        contours,
        hierarchy,
        cv.RETR_CCOMP,
        cv.CHAIN_APPROX_SIMPLE
    );

    // Reset image to full color
    cv.cvtColor(img, img, cv.COLOR_GRAY2BGRA);

    // Go through contours
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
}\n`;
    } else if (language == "Python") {
        code += `def circleObjectsHelper(img, max_objects, min_size, max_size):
    # Setup
    circle_list = []
    
    # Make image greyscale (to prevent errors)
    img = cv.cvtColor(img, cv.COLOR_RGBA2GRAY)
    
    # Find contours
    contours, hierarchy = cv.findContours(
        img,
        cv.RETR_CCOMP,
        cv.CHAIN_APPROX_SIMPLE
    )
    
    # Go through contours
    for contour in contours:
        center, radius = cv.minEnclosingCircle(contour)
        if (radius >= min_size and radius <= max_size):
            circle = {"center": center, "radius": radius}
            circle_list.append(circle)
    
    # Sort list by size (biggest first) and return biggest circles
    circle_list.sort(key=lambda circle: -(circle["radius"]))    
    return circle_list[0:max_objects]\n`;
    } else {
        throw `ERROR: Language ${language} is not supported yet`;
    }

    return code;
}

// Returns the code for the helper function for draw circles
// Helper function for insertHelperFuncs
function drawCirclesHelper(language) {
    // Setup
    let code = codeComment(language, "Draw circles helper function\n");

    if (language == "JavaScript") {
        code += `function drawCirclesHelper(img, circles) {
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
}\n`;
    } else if (language == "Python") {
        code += `def drawCirclesHelper(img, circles):
    yellow = (0, 255, 255)
    for circle in circles:
        # Draw circle & center
        # center and radius need to be a tuple of integers, and an integer
        circle["center"] = (int(circle["center"][0]), int(circle["center"][1]))
        circle["radius"] = int(circle["radius"])
        cv.circle(img, circle["center"], circle["radius"], yellow, 2)
        cv.circle(img, circle["center"], 1, yellow, 1)
        
        # Write radius
        font = cv.FONT_HERSHEY_SIMPLEX
        cv.putText(
            img,
            str(round(circle["radius"])),
            ((circle["center"][0] - circle["radius"]), (circle["center"][1] + circle["radius"])),
            font,
            0.5,
            yellow,
            2,
            cv.LINE_AA
        )
        
    return img\n`;
    } else {
        throw `ERROR: Language ${language} is not supported yet`;
    }

    return code;
}

// Helper function for generateCode()
// Returns code for overall image processing function
function makeFunction(language, toInsert, test = false) {
    let code = "";

    if (language == "JavaScript") {
        code += `// Takes in variable containing openCV image and modifies it
// Returns any function outputs (such as coordinates of objects)\n`;
        // for debugging
        if (test) {
            code += `processImage = function(img) {\n`;
        } else {
            code += `function processImage(img) {\n`;
        }
        code += `    // Setup
    let outputs = {};
    const input_width = 320; // Change to fit video
    const input_height = 240; // canvas dimensions

${toInsert}
    // Return outputs of sub functions
    return outputs;
}`;
    } else if (language == "Python") {
        code += `# Takes in variable containing openCV image and returns
# a tuple of its modified version and outputs (img, outputs)
def processImage(img):
    # Setup
    outputs = {}
    input_width = 320 # Change to fit your
    input_height = 240 # video dimensions
    
${toInsert}
    # Return outputs of sub functions
    return img, outputs
`;
    } else {
        throw `ERROR: Language ${language} is not supported yet`;
    }

    return code;
}

function codeComment(language, code) {
    if (language == "JavaScript") {
        return `// ${code}`;
    } else if (language == "Python") {
        return `# ${code}`;
    } else {
        throw `ERROR: Language ${language} is not supported yet`;
    }
}
