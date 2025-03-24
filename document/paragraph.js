import BaseObject from "./baseObject.js";
import Block from "./block.js";
import Line from "./line.js";

class Paragraph extends BaseObject {
    /** @type {Line[]} */
    #lines;

    /** @type {Block} */
    #block;
    #index = 0;

    constructor(paragraph, props, block, index) {
        super(paragraph, props);
        this.#block = block;
        this.#index = index;
        this.#lines = paragraph.lines.map((l, idx) => new Line(l, props, this, idx));
        this.#findSpaceWidth();
    }
    
    #findSpaceWidth() {
        this.lines.some((line) => {
            if (line.words.length > 1) {
                this.props.noteSpaceWidth(line.words[1].bbox.x0 - line.words[0].bbox.x1);
                return true;
            }
        });
    }

    get next() {
        return this.#block.paragraphs.at(this.#index + 1);
    }

    get prev() {
        return this.#block.paragraphs[this.#index - 1];
    }

    get lines() {
        return this.#lines;
    }

    get rawData() {
        return {
            bbox: this.bbox.rawData,
            lines: this.lines.map(l => l.rawData),
        }
    }
}

export default Paragraph;