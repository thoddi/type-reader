class Properties {
    /** @type {Promise<HTMLImageElement>} */
    #image;
    #spaceWidth = 0;
    #symbolWidth = 0;
    #wordHeight = 0;
    #fontSize = 0;
    #lineHeights = {
        frequency: {},
        maxCount: 0,
        mostCommon: 0
    };

    /**
     * @param {Promise<HTMLImageElement>} image
     */
    set image(image) {
        this.#image = image;
    }

    get image() {
        return this.#image;
    }

    noteSpaceWidth(width) {
        if (this.#spaceWidth < width) {
            this.#spaceWidth = width;
        }
    }

    get spaceWidth() {
        return this.#spaceWidth;
    }

    noteSymbolWidth(width) {
        if (this.#symbolWidth < width) {
            this.#symbolWidth = width;
        }
    }

    get symbolWidth() {
        return this.#symbolWidth;
    }

    noteWordHeight(height) {
        if (this.#wordHeight < height) {
            this.#wordHeight = height;
        }
    }

    get wordHeight() {
        return this.#wordHeight;
    }

    noteLineHeight(height) {
        let {frequency, maxCount} = this.#lineHeights;
        frequency[height] = (frequency[height] ?? 0) + 1;
        if (frequency[height] > maxCount) {
            this.#lineHeights.maxCount = frequency[height];
            this.#lineHeights.mostCommon = height;
        }
    }

    get commonLineHeight() {
        return this.#lineHeights.mostCommon;
    }

    /**
     * @param {number} size
     */
    set fontSize(size) {
        this.#fontSize = size;
    }

    get fontSize() {
        return this.#fontSize;
    }

    get scale() {
        return this.#wordHeight / this.#fontSize;
    }
}

export default Properties;