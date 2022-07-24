// Module holding displayInterface function used in setup for modules

// Takes in module's HTML code for display interface, replaces variables with their values, and inserts interface onto page
export default function displayInterface(destinationElement, id, HTMLcode) {
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
