import BaseObject from "./baseObject.js";
import Line from "./line.js";
import Properties from "./properties.js";
import Symbol from "./symbol.js";

class Word extends BaseObject {
    /** @type {Symbol[]} */
    #symbols;

    #text = '';

    /** @type {Promise<Image>} */
    #image;
    
    /** @type {Line} */
    #line;
    
    /** @type {number} */
    #index;

    /**
     * 
     * @param {object} word 
     * @param {Properties} props 
     * @param {Line} line 
     * @param {number} index 
     */
    constructor(word, props, line, index) {
        super(word, props);
        this.#symbols = word.symbols.map(s => new Symbol(s, props));
        this.#text = word.text;
        props.noteWordHeight(this.height);
        this.#line = line;
        this.#index = index;
        this.#image = this.#cropImage();
    }

    get #next() {
        const word = this.#line.words.at(this.#index + 1);
        if (word) {
            return word;
        }
        return this.#line.next?.words.at(0);
    }

    /** @type {Word?} */
    get prev() {
        const word = this.#line.words[this.#index - 1];
        if (word) {
            return word;
        }
        return this.#line.prev?.words.at(-1);
    }

    get lineHeight() {
        if (this.#index === 0) {
            return this.#line.lineHeight;
        }
        return this.props.commonLineHeight;
    }

    get symbols() {
        return this.#symbols;
    }

    get text() {
        return this.#text;
    }

    get image() {
        return this.#image;
    }

    get isSplit() {
        return this.#text.endsWith('-')
    }

    get widthWithoutDash() {
        if (this.isSplit === false) {
            return this.width;
        }
        return this.#symbols.at(-2).bbox.x1 - this.bbox.x0;
    }

    get fullWidth() {
        if (this.isSplit === false) {
            return this.width;
        }
        return this.width + this.spaceBetweenSplitWords + this.#next.width;
    }

    get spaceBetweenSplitWords() {
        if (this.isSplit === false) {
            return 0;
        }
        return (2 * this.props.symbolWidth) - this.symbols.at(-2).width - this.#next.symbols.at(0).width;
    }

    async shouldStartNewLine() {
        if (this.#index == 0 && await this.#line.prev?.shouldReturnAfterLine()) {
            return true;
        }
    }

    get #topOffset() {
        return this.bbox.y0 - this.#line.bbox.y0
    }

    /**
     * @returns {Promise<Image>}
     */
    async #cropImage() {
        const { x0, y0 } = this.bbox;
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = this.width;
        canvas.height = this.height;

        // context.save();
        // context.translate(wordCanvas.width/2,wordCanvas.height/2);
        // context.rotate(angle*Math.PI/180);
        context.drawImage(await this.props.image, x0, y0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
        // context.restore();

        return new Promise((resolve) => {
            const img = new Image();
            img.src = canvas.toDataURL();
            img.onload = () => {
                resolve(img);
            };
        });
    }

    get rawData() {
        return {
            text: this.text,
            bbox: this.bbox.rawData,
            symbols: this.symbols.map(s => s.rawData),
        }
    }
}

export default Word;