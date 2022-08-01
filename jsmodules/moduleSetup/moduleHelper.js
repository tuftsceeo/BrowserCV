// Module holding functions that help function-modules

// Gets HTML from server for interface, puts it in moduleCode
export async function loadCode(url, moduleCode) {
    fetch(url)
        .then((result) => {
            return result.text();
        })
        .then((content) => {
            moduleCode.contents = content;
        });
}

// Takes in module's HTML code for display interface, replaces variables with their values, and inserts interface onto page
export function displayInterface(destinationElement, id, HTMLcode) {
    // Replaces ${string}$ in the HTML with value of function[string] in Queue
    const reg = /\${(\w+)}\$/gi;
    let match = HTMLcode.match(reg);
    if (Array.isArray(match)) {
        for (let i = 0; i < match.length; i++) {
            const newreg = /(\w+)(?=\}\$)/gi;
            let submatch =
                functionQueue.functionWithID(id)[match[i].match(newreg)];
            HTMLcode = HTMLcode.replace(match[i], submatch);
        }
    }

    // Puts interface in destinationElement
    destinationElement.innerHTML = HTMLcode;
}

// Formats a line of code for generateCode functions
export function codeLine(code) {
    return `\t${code}\n`;
}

// Copies value of passed id to clipboard
// TargetId is the id of what you want to copy
// buttonId is the id of the button that calls this function
// parentId is the id of the parent DOM to the button (for alert)
export function copyToClip(targetId, buttonId, parentId) {
    let target = document.getElementById(targetId);

    // from W3Schools:
    // https://www.w3schools.com/howto/howto_js_copy_clipboard.asp
    // Select the text field
    target.select();
    target.setSelectionRange(0, 99999); /* For mobile devices */

    // Put selection on clipboard
    navigator.clipboard.writeText(target.value);

    if (buttonId && parentId) {
        // Find parent
        let parent = document.getElementById(parentId);

        // Create "copied!" alert
        let alert = document.createElement("label");
        alert.for = buttonId;
        alert.id = "copyAlert";
        alert.innerHTML = "copied!";

        // Clear previous alert and place new one
        let children = parent.children;
        if ("copyAlert" in children) {
            document.getElementById("copyAlert").remove();
            // Make label blink to show something happened
            setTimeout(() => {
                parent.appendChild(alert);
            }, 100);
        } else {
            parent.appendChild(alert);
        }
    }
}
