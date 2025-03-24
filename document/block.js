import Paragraph from "./paragraph.js";
import BaseObject from "./baseObject.js";

class Block extends BaseObject {
    /**
     * @type {Paragraph[]}
     */
    #paragraphs;
    constructor(block, properties) {
        super(block, properties);
        this.#paragraphs = block.paragraphs.map((p, idx) => new Paragraph(p, properties, this, idx));
    }

    get paragraphs() {
        return this.#paragraphs;
    }

    get rawData() {
        return {
            bbox: this.bbox.rawData,
            paragraphs: this.paragraphs.map(p => p.rawData),
        }
    }
}

export default Block;