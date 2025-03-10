import Block from "./block.js";
import Properties from "./properties.js";

class TypedDocument {
    /** @type {Block[]} */
    #blocks;

    /** @type {Properties} */
    #props;

    constructor(imageUrl, data, fontSize) {
        this.#props = new Properties();
        this.#props.fontSize = fontSize;
        this.#props.image = new Promise((resolve) => {
            const img = new Image();
            img.src = imageUrl;
            img.onload = () => {
                resolve(img);
            };
        });
        this.#blocks = data.blocks.map(b => new Block(b, this.#props));
    }

    get words() {
        return this.#blocks.flatMap(b => b.paragraphs)
                           .flatMap(p => p.lines)
                           .flatMap(l => l.words);
    }

    get lineHeight() {
        return this.#props.wordHeight;
    }

    get spaceWidth() {
        return this.#props.spaceWidth;
    }

    get symbolWidth() {
        return this.#props.symbolWidth;
    }

    get scale() {
        return this.#props.scale;
    }

    get rawData() {
        return {
            blocks: this.#blocks.map(b => b.rawData),
        }
    }
}

export default TypedDocument;