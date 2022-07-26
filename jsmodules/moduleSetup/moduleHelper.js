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
