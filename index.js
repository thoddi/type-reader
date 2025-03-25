import TypeReader from './typeReader.js';

const image = document.getElementById('image');
/** @type {HTMLImageElement} */
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

function drawResult(res){
	// octx.clearRect(0, 0, output.width, output.height)
	// octx.textAlign = 'left'

	console.log('result was:', res)
	// output_overlay.style.display = 'none'
	// output_text.innerHTML = res.text

	// progressUpdate({ status: 'done', data: res })

    const canvas = document.createElement('canvas');
    const ioctx = canvas.getContext('2d');

    canvas.width = imageOriginal.naturalWidth;
    canvas.height = imageOriginal.naturalHeight;

    ioctx.drawImage(imageOriginal,0,0);

    const lines = res.blocks.flatMap(it => it.paragraphs)
                        .flatMap(it => it.lines);

    lines.forEach(function(w){
        ioctx.strokeWidth = 2;
        ioctx.strokeStyle = 'green';

        ioctx.beginPath();
        ioctx.moveTo(w.baseline.x0, w.baseline.y0);
        ioctx.lineTo(w.baseline.x1, w.baseline.y1);
        ioctx.stroke();
    });
	lines.flatMap(it => it.words).forEach(function(w){
		var b = w.bbox;
		ioctx.strokeWidth = 2;
		ioctx.strokeStyle = 'red';

		ioctx.strokeRect(b.x0, b.y0, b.x1-b.x0, b.y1-b.y0);
	});

    imageOriginal.src = canvas.toDataURL();
}

const reader = new TypeReader('image');
await reader.record('eng');
reader.print(20);

console.log(reader.data);
console.log(btoa(reader.data));
drawResult(reader.data);

function hyphenateWord(word) {
    const vowels = ['a', 'e', 'i', 'o', 'u', 'y'];
    
    // Find an appropriate split point
    for (let i = 1; i < word.length - 1; i++) {
        if (vowels.includes(word[i]) && !vowels.includes(word[i - 1])) {
            // Split after a consonant followed by a vowel
            return [word.slice(0, i + 1) + '-', word.slice(i + 1)];
        }
    }
    
    // If no good split point is found, return the word as is
    return [word];
}

function hyphenateIcelandicWord(word) {
    const vowels = ['a', 'e', 'i', 'o', 'u', 'y', 'á', 'é', 'í', 'ó', 'ú', 'ý', 'ö', 'æ', 'ø'];
    
    // Find an appropriate split point
    for (let i = 1; i < word.length - 1; i++) {
        if (vowels.includes(word[i]) && !vowels.includes(word[i - 1])) {
            // Split after a consonant followed by a vowel
            return [word.slice(0, i + 1) + '-', word.slice(i + 1)];
        }
    }
    
    // If no good split point is found, return the word as is
    return [word];
}