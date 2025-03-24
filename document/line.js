import BaseObject, { Bbox } from "./baseObject.js";
import Paragraph from "./paragraph.js";
import Word from "./word.js";

class Line extends BaseObject {
    /** @type {Bbox} */
    #baseLine

    /** @type {Word[]} */
    #words

    /** @type {Paragraph} */
    #paragraph

    /** @type {number} */
    #index
    constructor(line, props, paragraph, index) {
        super(line, props);
        this.#baseLine = new Bbox(line.baseline);
        this.#words = line.words.map((w, idx) => new Word(w, this.props, this, idx));
        this.#paragraph = paragraph;
        this.#index = index;
    }

    get next() {
        const line = this.#paragraph.lines.at(this.#index + 1);
        if (line) {
            return line;
        }
        return this.#paragraph.next?.lines.at(0);
    }

    /** @type {Line?} */
    get prev() {
        const line = this.#paragraph.lines[this.#index - 1];
        if (line) {
            return line;
        }
        return this.#paragraph.prev?.lines.at(-1);
    }

    async shouldReturnAfterLine() {
        const image = await this.props.image;
        if ((this.width / image.width) < 0.7 ) {
            return true;
        }
        if (this.next.lineHeight > (this.lineHeight * 1.1)) {
            return true;
        }
        return false;
    }

    get baseLine() {
        return this.#baseLine;
    }

    /**
     * @returns {number}
     */
    get lineHeight() {
        if (this.prev) {
            return this.baseLine.y0 - this.prev.baseLine.y0;
        }
        return this.next.lineHeight;
    }

    get words() {
        return this.#words;
    }

    get rawData() {
        return {
            bbox: this.bbox.rawData,
            baseline: this.baseLine.rawData,
            words: this.words.map(w => w.rawData),
        }
    }
}

export default Line;