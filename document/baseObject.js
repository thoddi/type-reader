import Properties from "./properties.js";

class BaseObject {
    /** @type {Bbox} */
    #bbox;

    /** @type {Properties} */
    #properties;

    /**
     * 
     * @param {object} obj 
     * @param {Properties} props 
     */
    constructor(obj, props) {
        this.#bbox = new Bbox(obj.bbox);
        this.#properties = props;
    }

    get bbox() {
        return this.#bbox;
    }

    get props() {
        return this.#properties;
    }

    get width() {
        return this.#bbox.x1 - this.#bbox.x0;
    }

    get height() {
        return this.#bbox.y1 - this.#bbox.y0;
    }
}

export class Bbox {
    #x0 = 0;
    #x1 = 0;
    #y0 = 0;
    #y1 = 0;
    constructor(bbox) {
        this.#x0 = bbox.x0;
        this.#x1 = bbox.x1;
        this.#y0 = bbox.y0;
        this.#y1 = bbox.y1;

    }

    get x0() {
        return this.#x0;
    }

    get x1() {
        return this.#x1;
    }

    get y0() {
        return this.#y0;
    }

    get y1() {
        return this.#y1;
    }

    get rawData() {
        return {
            x0: this.#x0,
            x1: this.#x1,
            y0: this.#y0,
            y1: this.#y1,
        }
    }
}

export default BaseObject;