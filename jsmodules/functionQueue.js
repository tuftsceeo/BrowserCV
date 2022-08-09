// Module for FunctionQueue class which holds each processingFunction in order
// Exports:
// instance()
// making a change

// Global object to track which order functions should run in
class FunctionQueue {
    constructor() {
        this.length = 0;
        this.functions = [];
        this.id_gen_seed = 0;
    }

    // Returns length of queue
    get len() {
        return this.length;
    }

    // Returns functions Array
    get funcs() {
        return this.functions;
    }

    // Returns the function at a certain point in the queue
    function_at(index) {
        if ((index >= 0) & (index < this.length)) {
            return this.functions[index];
        } else {
            console.log("Please input valid index");
        }
    }

    // Add step to the function processing queue
    add(modulePointer) {
        // Creates function
        let idval = "ID" + this.id_gen_seed;
        let to_add = modulePointer.instance({ id: idval });

        // Adds function to queue
        this.functions.push(to_add);
        this.length++;
        this.id_gen_seed++;
        console.log("Added", modulePointer.moduleName);
        return idval;
    }

    // Finds index of function with certain id or logs that it wasn't found
    indexWithID(id) {
        for (let i = 0; i < this.length; i++) {
            let func = this.functions[i];
            if (func.id == id) {
                return i;
            }
        }
        console.log("No function found with id", id);
    }

    // Removes function with id from the queue
    // and removes its interface from page
    removeWithID(id) {
        // Remove function from queue
        let index = this.indexWithID(id);
        let temp = this.functions.splice(index, 1)[0];
        this.length--;

        // Removes interface from html on page
        let divToRemove = document.getElementById(id);
        divToRemove.remove();
        console.log("removed", temp["name"]);
    }

    // Takes last function off queue and returns a copy of it
    pop() {
        // Creates deep copy
        let temp = this.functions.pop();
        this.length--;
        return temp;
    }

    // Removes step from function processing queue
    removeStep() {
        if (this.len > 0) {
            let temp = this.pop();
            let divToRemove = document.getElementById(temp["id"]);
            divToRemove.remove();
            console.log("Removed:", temp["name"]);
        }
    }

    // Returns the function with the given ID
    functionWithID(id) {
        for (let i = 0; i < this.length; i++) {
            let func = this.functions[i];
            if (func.id == id) {
                return func;
            }
        }
        console.log("No function found with id", id);
    }

    // Returns array containing IDs of functions with outputs
    functionIdsWithOutput() {
        let toReturn = [];
        this.functions.forEach((func) => {
            if (func.outputs) {
                toReturn.push(func.id);
            }
        });
        return toReturn;
    }
}

// Returns new FunctionQueue
export function instance() {
    return new FunctionQueue();
}
