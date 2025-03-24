import Block from "./block.js";
import Properties from "./properties.js";

class TypedDocument {
    /** @type {Block[]} */
    #blocks;

    /** @type {Properties} */
    #props;

    constructor(imageUrl, data) {
        this.#props = new Properties();
        this.#props.image = new Promise((resolve) => {
            const img = new Image();
            img.src = imageUrl;
            img.onload = () => {
                resolve(img);
            };
        });
        this.#blocks = data.blocks.map(b => new Block(b, this.#props));

        this.#blocks.flatMap(b => b.paragraphs)
                    .flatMap(p => p.lines)
                    .forEach(l => this.#props.noteLineHeight(l.lineHeight));
    }

    get words() {
        return this.#blocks.flatMap(b => b.paragraphs)
                           .flatMap(p => p.lines)
                           .flatMap(l => l.words);
    }

    // get lineHeight() {
    //     return this.#props.wordHeight;
    // }

    get spaceWidth() {
        return this.#props.spaceWidth;
    }

    get symbolWidth() {
        return this.#props.symbolWidth;
    }

    get scale() {
        return this.#props.scale;
    }

    /** @param {number} value */
    set fontSize(value) {
        this.#props.fontSize = value;
    }

    get rawData() {
        return {
            blocks: this.#blocks.map(b => b.rawData),
        }
    }
}

export default TypedDocument;