export class GlobalsFeatures {
    constructor() {
        this.setNewGlobalObject();
    }

    private setNewGlobalObject() {
        Object.prototype.empty = (object : {}) : boolean => {
            return Object.entries(object).length ? false : true;
        }
    }
}