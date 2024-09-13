export class GlobalsFeatures {
    constructor() {
        this.setNewGlobalObject();
    }
    setNewGlobalObject() {
        Object.prototype.empty = (object) => {
            return Object.entries(object).length ? false : true;
        };
    }
}
