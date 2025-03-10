class Linker {
    #item;
    twoWayLink(nextItem) {
        if (this.#item) {
            this.#item.next = nextItem;
            nextItem.prev = this.#item;
        }
        this.#item = nextItem;
    }
}

export default Linker;