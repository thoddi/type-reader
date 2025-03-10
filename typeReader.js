import Tesseract from './node_modules/tesseract.js/dist/tesseract.esm.min.js';
// import Linker from './linker.js';
import TypedDocument from './document/document.js';

/**
 * @typedef Bbox
 * @type {object}
 * @property {number} x0
 * @property {number} x1
 * @property {number} y0
 * @property {number} y1
 */

/**
 * @typedef Word
 * @type {object}
 * @property {Bbox} bbox
 * @property {string} text
 * @property {Symbols} symbols
 * @property {Image} image
 * @property {Word?} next
 * @property {Word?} prev
 */

/**
 * @typedef Line
 * @type {object}
 * @property {Bbox} bbox
 * @property {Bbox} baseline
 * @property {Word[]} words
 */

/**
 * @typedef Symbols
 * @type {object}
 * @property {Bbox} bbox
 */

class TypeReader {
    /** @type {Promise} */
    #workerPromise;

    /** @type {HTMLImageElement} */
    #img;

    /** @type {CanvasRenderingContext2D} */
    #context;

    /** @type {number} */
    #fontSize;

    /** @type {TypedDocument} */
    #document;

    constructor(imgId, fontSize) {
        this.#fontSize = fontSize;
        this.#workerPromise = Tesseract.createWorker('eng', 1);

        this.#img = document.getElementById(imgId);
        this.#img.dataset.src = this.#img.src;
        this.#img.crossOrigin = "Anonymous";
        
        const canvas = document.createElement('canvas');
        canvas.height = 1000;
        this.#context = canvas.getContext('2d')
        if(!this.#context) {
            throw new Error('Context missing.');
        }

        // if (this.#img.dataset.data) {
        //     /** @type {Word[]} */
        //     const words = JSON.parse(this.#img.dataset.data);
        //     const promises = [];
        //     words.map(word => {
        //         const url = word.image;
        //         word.image = new Image();
        //         word.image.src = url;
        //         word.image.onload(() => {

        //         });
        //     });
        // }
        const resizeObserver = new ResizeObserver(() => this.print());
        resizeObserver.observe(this.#img.parentElement);
    }

    async record() {
        console.log('record');
        if (this.#img.dataset.data) {
            const json = atob(this.#img.dataset.data);
            console.log(json);
            const data = JSON.parse(json);
            console.log('result was:', data);
            this.#document = new TypedDocument(this.#img.dataset.src, data, this.#fontSize);
        }
        else {
            const worker = await this.#workerPromise;
            const { data } = await worker.recognize(this.#img.dataset.src, 'eng', { blocks: true });
            
            console.log('result was:', data)
            this.#document = new TypedDocument(this.#img.dataset.src, data, this.#fontSize);
        }
    }

    async print() {
        if (this.#document === undefined) {
            return;
        }
        console.log('print');
        const parentWidth = this.#img.parentElement.offsetWidth;
        const pageWidth = parentWidth * this.#document.scale;
        this.#context.canvas.width = pageWidth;

        let x = 0;
        let y = 0;
        for (const word of this.#document.words) {
            if (x + word.fullWidth > pageWidth) {
                y += this.#document.lineHeight;
                x = 0;
            }
            if (word.isSplit) {
                this.#context.drawImage(await word.image, 0, 0, word.widthWithoutDash, word.height, x, y, word.widthWithoutDash, word.height);
                x += word.widthWithoutDash + word.spaceBetweenSplitWords;
            } else {
                this.#context.drawImage(await word.image, x, y);
                x += word.width + this.#document.spaceWidth;
            }
        }
        
        this.#img.src = this.#context.canvas.toDataURL();
    }

    static #calculateRotationAngle(x0, y0, x1, y1) {
        // Calculate the difference in coordinates
        const deltaX = x1 - x0;
        const deltaY = y1 - y0;
    
        // Calculate the angle in radians
        const angleRadians = Math.atan(deltaY / deltaX);
    
        // Convert the angle to degrees
        const angleDegrees = angleRadians * (180 / Math.PI);
    
        return angleDegrees;
    }

    static async print(imgId, fontSize) {
        console.log('2')
        const reader = new TypeReader(imgId, fontSize);
        await reader.record();
        reader.print();
        const data = reader.#document.rawData;
        const json = JSON.stringify(data);
        console.log(btoa(json));
    }
}

TypeReader.print('image', 20);
