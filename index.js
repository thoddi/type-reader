import TypeReader from './typeReader.js';

const image = document.getElementById('image');
const imageOriginal = document.getElementById('img-original');

const fontSize = document.getElementById('font-size');
fontSize.addEventListener('input', (event) => {
    const size = Number(event.target.value);
    reader.print(size);
});

// /** @type {HTMLInputElement} */
const imgFile = document.getElementById('img-file');
imgFile.addEventListener('change', async (event) => {
    /** @type {File?} */
    const file = event.target.files[0];
    if (file) {
        var src = URL.createObjectURL(file);
        image.dataset.src = src;
        delete image.dataset.data;
        imageOriginal.src = src;

        await reader.record('eng');
        reader.print(Number(fontSize.value));
    }
});

const reader = new TypeReader('image');
await reader.record('eng');
reader.print(20);

