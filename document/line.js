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
        this.#words = line.words.map((w, idx) => new Word(w, this.props, this, () => {
            const next = this.#words.at(idx + 1);
            if (next === undefined) {
                const nextLine = nextLine();
                next = nextLine.words.at(0);
            }
            return next;
        }));
        this.#paragraph = paragraph;
        this.#index = index;
    }

    get next() {
        return this.#paragraph.lines.at(this.#index + 1);
    }

    get baseLine() {
        return this.#baseLine;
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