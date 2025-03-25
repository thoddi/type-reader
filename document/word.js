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

        for(let i = 1; i < this.#text.length; i++) {
            const space = this.#symbols[i].bbox.x0 - this.#symbols[i-1].bbox.x1;
            props.noteSpaceBetweenSymbols(this.#text[i-1], this.#text[i], space);
        }
    }

    /** @returns {Word} */
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
        return this.#text.endsWith('-') && !this.#text.endsWith('--');
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
        const space = this.props.getSpaceBetweenSymbols(this.text.at(-2), this.#next.text.at(0));
        if (space) {
            return space;
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

        
        /**
         * Draws rect and baseline for the word. (for debugging)
         */
        // const distance = this.getBaseLineOffset();
        // context.strokeWidth = 2;
		// context.strokeStyle = 'red';
		// context.strokeRect(0, 0, canvas.width,canvas.height);
        // context.strokeStyle = 'green';
        // context.beginPath();
        // context.moveTo(0, -1 * distance);
        // context.lineTo(canvas.width, -1 * distance);
        // context.stroke();

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

    getBaseLineOffset() {
        const rect = this.bbox;
        const line = this.#line.baseLine;
        const rectBottomY = rect.y0; // Bottom of the rectangle
        const lineSlope = (line.y1 - line.y0) / (line.x1 - line.x0); // Slope of the line
        const rectBottomX = rect.x0; // The x-coordinate to check on the line

        // Check if the rectangle's x-coordinate falls within the line's range
        if (rectBottomX >= Math.min(line.x0, line.x1) && rectBottomX <= Math.max(line.x0, line.x1)) {
            // Find the y-coordinate on the line at rect.x0
            const lineY = line.y0 + lineSlope * (rectBottomX - line.x0);

            // Calculate the vertical distance
            const verticalDistance = rectBottomY - lineY;

            return verticalDistance; // Positive if rect is above, negative if rect is below
        } else {
            return null; // No valid intersection in the horizontal range
        }
    }
}

export default Word;