import BaseObject from "./baseObject.js";
import Line from "./line.js";

class Paragraph extends BaseObject {
    /** @type {Line[]} */
    #lines;
    constructor(paragraph, props) {
        super(paragraph, props);
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