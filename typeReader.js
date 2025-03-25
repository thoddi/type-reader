import Tesseract from 'https://cdn.jsdelivr.net/npm/tesseract.js@6/dist/tesseract.esm.min.js';
import TypedDocument from './document/document.js';

class TypeReader {
    /** @type {Promise} */
    #workerPromise;

    /** @type {HTMLImageElement} */
    #img;

    /** @type {TypedDocument} */
    #document;

    /** @type {CanvasRenderingContext2D} */
    #context;

    #data;

    constructor(imgId) {
        this.#workerPromise = Tesseract.createWorker('eng', 1);

        this.#img = document.getElementById(imgId);
        this.#img.dataset.src = this.#img.src;
        this.#img.crossOrigin = "Anonymous";

        const canvas = document.createElement('canvas');
        this.#context = canvas.getContext('2d');
        
        const resizeObserver = new ResizeObserver(() => this.print());
        resizeObserver.observe(this.#img.parentElement);
    }

    async record(lang) {
        if (this.#img.dataset.data) {
            const json = atob(this.#img.dataset.data);
            const data = JSON.parse(json);
            this.#data = data;
            this.#document = new TypedDocument(this.#img.dataset.src, data);
        }
        else {
            const worker = await this.#workerPromise;
            const { data } = await worker.recognize(this.#img.dataset.src, lang, { blocks: true });
            this.#data = data;
            this.#document = new TypedDocument(this.#img.dataset.src, data);
        }
    }

    #resizeCanvas(height) {
        const newCanvas = document.createElement('canvas');
        newCanvas.width = this.#context.canvas.width;
        newCanvas.height = height;
        const newContext = newCanvas.getContext('2d');

        newContext.drawImage(this.#context.canvas, 0, 0);

        this.#context = newContext;
    }

    async print(fontSize) {
        if (this.#document === undefined) {
            return;
        }
        if (fontSize) {
            this.#document.fontSize = fontSize;
        }
        console.count('print');

        const parentWidth = this.#img.parentElement.offsetWidth;
        const pageWidth = parentWidth * this.#document.scale;

        this.#context.canvas.width = pageWidth;
        this.#context.canvas.height = 1000;

        let x = 0;
        let y = this.#document.words[0].lineHeight;
        for (const word of this.#document.words) {
            if (x + word.fullWidth > pageWidth
                || await word.shouldStartNewLine()
            ) {
                y += word.lineHeight;
                x = 0;
                if (this.#context.canvas.height < y + word.lineHeight) {
                    this.#resizeCanvas(this.#context.canvas.height + 1000);
                }
            }
            if (word.isSplit) {
                this.#context.drawImage(await word.image, 0, 0, word.widthWithoutDash, word.height, x, y + word.getBaseLineOffset(), word.widthWithoutDash, word.height);
                x += word.widthWithoutDash + word.spaceBetweenSplitWords;
            } else {
                this.#context.drawImage(await word.image, x, y + word.getBaseLineOffset());
                x += word.width + this.#document.spaceWidth;
            }
        }

        this.#resizeCanvas(y + this.#document.words.at(-1).lineHeight);

        this.#img.style.visibility = 'hidden';
        this.#img.style.width = this.#context.canvas.width / this.#document.scale + 'px';
        this.#img.src = this.#context.canvas.toDataURL();
        this.#img.style.visibility = 'visible';
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

    get data() {
        return this.#data;
    }
    // static async print(imgId, fontSize) {
    //     const reader = new TypeReader(imgId, fontSize);
    //     await reader.record();
    //     reader.print();
    //     const data = reader.#document.rawData;
    //     const json = JSON.stringify(data);
    //     console.log(btoa(json));
    // }
}

export default TypeReader;
