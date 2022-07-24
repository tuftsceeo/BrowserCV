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

// function loadCode(moduleCodePath, callback) {
//     let xhttp = new XMLHttpRequest();
//     xhttp.onreadystatechange = function () {
//         let HTMLcode = ""; // empty
//         if (this.readyState == 4) {
//             if (this.status == 200) {
//                 HTMLcode = this.responseText;
//             }
//             if (this.status == 404) {
//                 HTMLcode = "Page not found.";
//             }
//             callback = HTMLcode; // set this module's variable to the code
//         }
//     };
//     xhttp.open("GET", moduleCodePath, true);
//     xhttp.send();
// }
