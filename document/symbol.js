import BaseObject from "./baseObject.js";
import Properties from "./properties.js";

class Symbol extends BaseObject {
    /**
     * 
     * @param {object} symbol 
     * @param {Properties} props 
     */
    constructor(symbol, props) {
        super(symbol, props);
        props.noteSymbolWidth(this.width);
    }

    get rawData() {
        return {
            bbox: this.bbox.rawData
        };
    }
}

export default Symbol;