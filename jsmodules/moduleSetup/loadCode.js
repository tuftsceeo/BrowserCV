// Module holding loadCode function used in setup for modules

// Gets HTML from server for interface, puts it in moduleCode
export default async function loadCode(url, moduleCode) {
    fetch(url)
        .then((result) => {
            return result.text();
        })
        .then((content) => {
            moduleCode.contents = content;
        });
}
