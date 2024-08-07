const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let painting = false;
let brushSize = 5;
let color = '#000000';
let shape = 'free';
let startX, startY;

function startPosition(e) {
    painting = true;
    [startX, startY] = [e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop];
    if (shape === 'free') {
        draw(e);
    } else if (shape === 'bucket') {
        fillColor(startX, startY);
    }
}

function endPosition() {
    if (shape !== 'free' && shape !== 'bucket') {
        drawShape();
    }
    painting = false;
    ctx.beginPath();
}

function draw(e) {
    if (!painting) return;

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;

    if (shape === 'free') {
        ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    }
}

function drawShape() {
    const endX = event.clientX - canvas.offsetLeft;
    const endY = event.clientY - canvas.offsetTop;
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;

    switch (shape) {
        case 'line':
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            break;
        case 'rect':
            ctx.beginPath();
            ctx.rect(startX, startY, endX - startX, endY - startY);
            ctx.stroke();
            break;
        case 'circle':
            ctx.beginPath();
            const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
            ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
            ctx.stroke();
            break;
    }
}

function fillColor(x, y) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const targetColor = getColorAt(x, y, imageData);
    if (colorsMatch(targetColor, hexToRgbA(color))) return;

    const stack = [[x, y]];
    const visited = new Set();
    const isInBounds = (x, y) => x >= 0 && y >= 0 && x < canvas.width && y < canvas.height;

    while (stack.length > 0) {
        const [x, y] = stack.pop();
        const key = `${x},${y}`;
        if (!isInBounds(x, y) || visited.has(key)) continue;
        visited.add(key);

        if (colorsMatch(getColorAt(x, y, imageData), targetColor)) {
            setColorAt(x, y, hexToRgbA(color), imageData);

            stack.push([x + 1, y]);
            stack.push([x - 1, y]);
            stack.push([x, y + 1]);
            stack.push([x, y - 1]);
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function getColorAt(x, y, imageData) {
    const index = (y * imageData.width + x) * 4;
    return [
        imageData.data[index],
        imageData.data[index + 1],
        imageData.data[index + 2],
        imageData.data[index + 3]
    ];
}

function setColorAt(x, y, color, imageData) {
    const [r, g, b, a] = color;
    const index = (y * imageData.width + x) * 4;
    imageData.data[index] = r;
    imageData.data[index + 1] = g;
    imageData.data[index + 2] = b;
    imageData.data[index + 3] = a;
}

function colorsMatch(color1, color2) {
    return color1.every((val, i) => val === color2[i]);
}

function hexToRgbA(hex) {
    let r = 0, g = 0, b = 0, a = 255;
    if (hex.length === 7) {
        r = parseInt(hex.slice(1, 3), 16);
        g = parseInt(hex.slice(3, 5), 16);
        b = parseInt(hex.slice(5, 7), 16);
    } else if (hex.length === 9) {
        r = parseInt(hex.slice(1, 3), 16);
        g = parseInt(hex.slice(3, 5), 16);
        b = parseInt(hex.slice(5, 7), 16);
        a = Math.round(parseInt(hex.slice(7, 9), 16) / 255 * 100);
    }
    return [r, g, b, a];
}

function setColor(newColor) {
    color = newColor;
}

function setBrushSize(size) {
    brushSize = size;
}

function setShape(newShape) {
    shape = newShape;
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', endPosition);
canvas.addEventListener('mousemove', draw);
