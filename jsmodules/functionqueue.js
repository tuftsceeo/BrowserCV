// Global object to track which order functions should run in
class FunctionQueue {
    constructor() {
        this.length = 0;
        this.functions = [];
        this.includes_greyscale = false;
        this.id_gen_seed = 0;
    }

    // Returns length of queue
    get len() {
        return this.length;
    }

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
    // Won't add greyscale twice
    add(modulePointer) {
        // Checks if greyscale is already there
        if (
            modulePointer.moduleName == "greyscale" &&
            this.includes_greyscale
        ) {
            console.log("Can't Greyscale more than once");
            return;
        }

        let id = "ID" + this.id_gen_seed;
        let temp = modulePointer.instance(id);

        this.functions[this.length] = temp;
        this.length++;
        this.id_gen_seed++;
        console.log("Added", modulePointer.moduleName);
        return id;
    }

    indexWithID(id) {
        for (let i = 0; i < this.length; i++) {
            let func = this.functions[i];
            if (func.id == id) {
                return i;
            }
        }
        console.log("No function found with id", id);
    }

    removeWithID(id) {
        let index = this.indexWithID(id);
        let temp = this.functions.splice(index, 1)[0];
        this.length--;
        if (temp.name == "greyscale") {
            this.includes_greyscale = false;
        }
        let divToRemove = document.getElementById(id);
        divToRemove.remove();
        console.log("removed", temp["name"]);
    }

    // Takes last function off queue and returns a copy of it
    pop() {
        // Creates deep copy
        let temp = this.functions.pop();
        this.length--;
        if (temp.name == "greyscale") {
            this.includes_greyscale = false;
        }
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
}

export function instance() {
    return new FunctionQueue();
}
