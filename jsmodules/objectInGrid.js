// Module for ObjectInGrid processing function and related js functions
// Exports:
// moduleName
// render(destinationElement, id)
// instance(id)
// generateCode()

// Imports
import * as act from "./onImageActions/actions.js"; // for execute
import * as mh from "./moduleSetup/moduleHelper.js"; // for module setup

// Identifier
export let moduleName = "is object in grid";

// internal variables:
let moduleCodePath = "../Function Interfaces/objectInGridInterface.html";
// onload of module, get moduleCode
let moduleCode = { contents: null };
mh.loadCode(moduleCodePath, moduleCode);

// Sets innerHTML of destinationElement to this module's interface
export function render(destinationElement, id) {
    // Puts function interface HTML on page
    mh.displayInterface(destinationElement, id, moduleCode.contents);

    // Add which functions have outputs to selector
    const outputSelect = document.getElementById(id + "outputFrom");
    addOutputOptions(outputSelect, id);

    // Initialize to outputs from whichever function outputSelect defaults to
    let thisFunc = functionQueue.functionWithID(id);
    thisFunc.params.outputFromId = outputSelect.value;

    outputSelect.addEventListener("input", function () {
        // Save their selection
        const selection = outputSelect.value;

        // Check if output options have changed and change them
        addOutputOptions(outputSelect, id, true);

        // Record user's choice
        thisFunc.params.outputFromId = selection;
        outputSelect.value = selection;
    });

    // Add initial 4x4 grid squares
    const gridTab = document.getElementById(id + "grid");
    updateGrid(gridTab, 4, 4, id);

    // Add listener to change grid size on grid width or height change
    const gridWidth = document.getElementById(id + "width");
    const gridHeight = document.getElementById(id + "height");
    gridWidth.addEventListener("input", function () {
        updateGrid(gridTab, gridWidth.value, gridHeight.value, id);
    });
    gridHeight.addEventListener("input", function () {
        updateGrid(gridTab, gridWidth.value, gridHeight.value, id);
    });
}

// Class representing objectInGrid function that gets added to functionQueue
class ObjectInGrid {
    name = "objectInGrid";
    params = {
        outputFromId: null,
        gridWidth: 4,
        gridHeight: 4,
        gridValues: [
            [1, 1, 1, 1],
            [1, 1, 1, 1],
            [1, 1, 1, 1],
            [1, 1, 1, 1],
        ],
    };
    outputs = {
        total: 0,
    };

    constructor(argmap) {
        this.id = argmap.id;
    }

    get total() {
        return this.outputs.total;
    }

    get outputFromId() {
        return this.params.outputFromId;
    }

    get gridWidth() {
        return this.params.gridWidth;
    }

    get gridHeight() {
        return this.params.gridHeight;
    }

    get gridValues() {
        return this.params.gridValues;
    }

    execute(img) {
        // Add points for grid squares objects are in
        const hSpacing = input_width / this.gridWidth;
        const vSpacing = input_height / this.gridHeight;
        if (this.outputFromId) {
            try {
                const outputs = functionQueue.functionWithID(
                    this.outputFromId
                ).outputs;
                this.outputs.total = 0;
                if ("circles" in outputs) {
                    outputs.circles.forEach((circle) => {
                        let hGridIdx = Math.floor(circle.center.x / hSpacing);
                        let vGridIdx = Math.floor(circle.center.y / vSpacing);
                        this.outputs.total += Number(
                            this.gridValues[vGridIdx][hGridIdx]
                        );
                    });
                }

                // Display total
                document.getElementById(this.id + "total").innerHTML =
                    this.outputs.total;
            } catch (error) {
                console.log(
                    "objectInGrid isn't getting output from a different function"
                );
            }
        }

        // Draw grid
        let green = new cv.Scalar(0, 255, 0, 255);
        for (let i = 1; i < this.gridHeight; i++) {
            // Draw horizontal lines
            cv.line(
                img,
                { x: 0, y: i * vSpacing },
                { x: input_width, y: i * vSpacing },
                green,
                1,
                cv.LINE_AA,
                0
            );
        }
        for (let i = 1; i < this.gridWidth; i++) {
            // Draw vertical lines
            cv.line(
                img,
                { x: i * hSpacing, y: 0 },
                { x: i * hSpacing, y: input_height },
                green,
                1,
                cv.LINE_AA,
                0
            );
        }
        const font = cv.FONT_HERSHEY_SIMPLEX;
        for (let i = 0; i < this.gridHeight; i++) {
            for (let j = 0; j < this.gridWidth; j++) {
                let value = this.gridValues[i][j].toString();
                let xPadding = value.length * 10;
                cv.putText(
                    img,
                    value,
                    {
                        x: (j + 1) * hSpacing - xPadding,
                        y: (i + 1) * vSpacing - 5,
                    },
                    font,
                    0.5,
                    green,
                    2,
                    cv.LINE_AA
                );
            }
        }
    }

    generateCode(language) {
        // Setup
        let code = "";
        let lines = "";

        if (language == "JavaScript") {
            lines = [`const ${this.id}gridValues = [`];

            // Hardcoding in gridValues
            let insertArrayText = [];
            this.gridValues.forEach((line) => {
                insertArrayText.push(`    [${line}],`);
            });
            lines = lines.concat(insertArrayText);

            lines = lines.concat([
                `];`,
                ``,
                `// Add points for grid squares objects are in`,
                `const ${this.id}hSpacing = input_width / ${this.gridWidth};`,
                `const ${this.id}vSpacing = input_height / ${this.gridHeight};`,
            ]);

            // If function isn't looking at another's output, don't include code
            if (this.outputFromId) {
                lines = lines.concat([
                    `const outputs${this.id} = outputs.${this.outputFromId};`,
                    `outputs.${this.id} = 0;`,
                    `if (outputs${this.id}) {`,
                    `    outputs${this.id}.forEach((circle) => {`,
                    `        let hGridIdx = Math.floor(circle.center.x / ${this.id}hSpacing);`,
                    `        let vGridIdx = Math.floor(circle.center.y / ${this.id}vSpacing);`,
                    `        outputs.${this.id} += Number(`,
                    `            ${this.id}gridValues[vGridIdx][hGridIdx]`,
                    `        );`,
                    `    });`,
                    `}`,
                    ``,
                ]);
            }

            // Drawing grid code runs regardless
            lines = lines.concat([
                `// Draw grid`,
                `for (let i = 1; i < ${this.gridHeight}; i++) {`,
                `    // Draw horizontal lines`,
                `    cv.line(`,
                `        img,`,
                `        { x: 0, y: i * ${this.id}vSpacing },`,
                `        { x: input_width, y: i * ${this.id}vSpacing },`,
                `        green,`,
                `        1,`,
                `        cv.LINE_AA,`,
                `        0`,
                `    );`,
                `}`,
                `for (let i = 1; i < ${this.gridWidth}; i++) {`,
                `    // Draw vertical lines`,
                `    cv.line(`,
                `        img,`,
                `        { x: i * ${this.id}hSpacing, y: 0 },`,
                `        { x: i * ${this.id}hSpacing, y: input_height },`,
                `        green,`,
                `        1,`,
                `        cv.LINE_AA,`,
                `        0`,
                `    );`,
                `}`,
                ``,
                `// Write value on grid`,
                `for (let i = 0; i < ${this.gridHeight}; i++) {`,
                `    for (let j = 0; j < ${this.gridWidth}; j++) {`,
                `        let value = ${this.id}gridValues[i][j].toString();`,
                `        let xPadding = value.length * 10;`,
                `        cv.putText(`,
                `            img,`,
                `            value,`,
                `            {`,
                `                x: (j + 1) * ${this.id}hSpacing - xPadding,`,
                `                y: (i + 1) * ${this.id}vSpacing - 5,`,
                `            },`,
                `            font,`,
                `            0.5,`,
                `            green,`,
                `            2,`,
                `            cv.LINE_AA`,
                `        );`,
                `    }`,
                `}`,
            ]);
        } else if (language == "Python") {
            lines = [`${this.id}gridValues = [`];

            // Hardcoding in gridValues
            let insertArrayText = [];
            this.gridValues.forEach((line) => {
                insertArrayText.push(`    [${line}],`);
            });
            lines = lines.concat(insertArrayText);

            lines = lines.concat([
                `]`,
                ``,
                `# Add points for grid squares objects are in`,
                `${this.id}hSpacing = int(input_width / ${this.gridWidth})`,
                `${this.id}vSpacing = int(input_height / ${this.gridHeight})`,
            ]);

            // If function isn't looking at another's output, don't include code
            if (this.outputFromId) {
                lines = lines.concat([
                    `outputs${this.id} = outputs["${this.outputFromId}"]`,
                    `outputs["${this.id}"] = 0;`,
                    `if (outputs${this.id}):`,
                    `    for circle in outputs${this.id}:`,
                    `        hGridIdx = int(np.floor(circle["center"][0] / ${this.id}hSpacing))`,
                    `        vGridIdx = int(np.floor(circle["center"][1] / ${this.id}vSpacing))`,
                    `        if (((hGridIdx >= 0) and (hGridIdx < ${this.gridWidth})) and ((vGridIdx >= 0) and (vGridIdx < ${this.gridHeight}))):`,
                    `           outputs["${this.id}"] += float(${this.id}gridValues[vGridIdx][hGridIdx])`,
                    ``,
                ]);
            }

            // Drawing grid code runs regardless
            lines = lines.concat([
                `# Draw grid`,
                `for i in range(0, ${this.gridHeight}):`,
                `   # Draw horizontal lines`,
                `   cv.line(`,
                `           img,`,
                `           (0, i * ${this.id}vSpacing),`,
                `           (input_width, i * ${this.id}vSpacing),`,
                `           green,`,
                `           1,`,
                `           cv.LINE_AA,`,
                `           0`,
                `          )`,
                ``,
                `for i in range(0, ${this.gridWidth}):`,
                `    # Draw vertical lines`,
                `    cv.line(`,
                `        img,`,
                `        (i * ${this.id}hSpacing, 0),`,
                `        (i * ${this.id}hSpacing, input_height),`,
                `        green,`,
                `        1,`,
                `        cv.LINE_AA,`,
                `        0`,
                `    )`,
                ``,
                `# Write value on grid`,
                `for i in range(0, ${this.gridHeight}):`,
                `   for j in range(0, ${this.gridWidth}):`,
                `        value = str(${this.id}gridValues[i][j])`,
                `        xPadding = len(value) * 10`,
                `        cv.putText(`,
                `            img,`,
                `            value,`,
                `            (`,
                `                (j + 1) * ${this.id}hSpacing - xPadding,`,
                `                (i + 1) * ${this.id}vSpacing - 5`,
                `            ),`,
                `            font,`,
                `            0.5,`,
                `            green,`,
                `            2,`,
                `            cv.LINE_AA`,
                `        )`,
                ``,
            ]);
        } else {
            throw `Language: ${language} not currently supported`;
        }

        // Format each code line
        lines.forEach((line) => {
            code += mh.codeLine(line);
        });

        return {
            code: code,
            helperNames: ["font", "green"],
        };
    }
}

// Returns a new ObjectInGrid with id as the id
export function instance(argmap) {
    return new ObjectInGrid(argmap);
}

// Helper function for render()
// Adds which functions have outputs to selector
function addOutputOptions(outputSelect, thisId, reset = false) {
    if (reset) {
        // Take away old options
        mh.removeChildren(outputSelect);
    }

    // Add new options
    const outputIds = functionQueue.functionIdsWithOutput();
    outputIds.forEach((id) => {
        if (id != thisId) {
            let option = document.createElement("option");
            const func = functionQueue.functionWithID(id);
            option.innerHTML = `${func.id}: ${func.name}`;
            option.value = func.id;
            outputSelect.appendChild(option);
        }
    });
}

function updateGrid(gridTab, gridWidth, gridHeight, id) {
    // Update values in class in functionQueue
    functionQueue.functionWithID(id).params.gridWidth = gridWidth;
    functionQueue.functionWithID(id).params.gridHeight = gridHeight;

    // Creates a cell in the table - for appending to rows
    let createBox = function (i, j, id) {
        let box = document.createElement("td");
        box.id = `${id}box${i},${j}`;
        let input = document.createElement("input");
        input.value = 1;
        input.id = `${id}input${i},${j}`;
        input.type = "number";
        input.min = 0;
        input.style = "width: 5em;";
        box.appendChild(input);
        functionQueue.functionWithID(id).params.gridValues[i][j] = 1;
        input.addEventListener("input", function () {
            functionQueue.functionWithID(id).params.gridValues[i][j] = Number(
                input.value
            );
        });
        return box;
    };

    // Checks what the change is. If user deletes entry, table doesn't change
    if (gridWidth === "" || gridHeight === "") {
        return;
    } else if (!gridTab.firstChild) {
        // Add all rows and columns
        for (let i = 0; i < gridHeight; i++) {
            let row = document.createElement("tr");
            row.id = `${id}row${i}`;
            for (let j = 0; j < gridWidth; j++) {
                row.appendChild(createBox(i, j, id));
            }
            gridTab.appendChild(row);
        }
    } else if (gridHeight < gridTab.rows.length) {
        // Remove excess rows
        for (let i = gridTab.rows.length; i > gridHeight; i--) {
            gridTab.removeChild(gridTab.rows[i - 1]);
            functionQueue.functionWithID(id).params.gridValues.pop();
        }
    } else if (gridWidth < gridTab.rows[0].cells.length) {
        // remove excess cols
        for (let i = 0; i < gridTab.rows.length; i++) {
            let row = gridTab.rows[i];
            for (let i = row.cells.length; i > gridWidth; i--) {
                row.removeChild(row.cells[i - 1]);
                functionQueue.functionWithID(id).params.gridValues[i].pop();
            }
        }
    } else if (gridWidth > gridTab.rows[0].cells.length) {
        // add new cols
        for (let i = 0; i < gridTab.rows.length; i++) {
            let row = gridTab.rows[i];
            for (let j = row.cells.length; j < gridWidth; j++) {
                row.appendChild(createBox(i, j, id));
            }
        }
    } else if (gridHeight > gridTab.rows.length) {
        // Add new rows
        for (let i = gridTab.rows.length; i < gridHeight; i++) {
            let row = document.createElement("tr");
            row.id = `${id}row${i}`;
            functionQueue.functionWithID(id).params.gridValues[i] = Array();
            for (let j = 0; j < gridWidth; j++) {
                row.appendChild(createBox(i, j, id));
            }
            gridTab.appendChild(row);
        }
    }
}
