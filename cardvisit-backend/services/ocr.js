const Tesseract = require('tesseract.js');
const cv = require('opencv4nodejs');

module.exports = {
    recognize: function ({
        sourceUrl,
        sourceLanguage
    }) {
        const promise = new Promise(function (resolve, reject) {
            Tesseract.recognize(
                sourceUrl,
                sourceLanguage,
                { logger: m => console.log(m) }
            )
                .then(({ data: { text } }) => resolve(text))
                .catch(err => reject(err))
        });
        return promise;
    },
    scanTargetObject: async function (sourceUrl) {
        let image = await cv.imreadAsync(sourceUrl);
        const origin = await image.copyAsync();
        const ratio = image.sizes[1] / 500;

        let processedImage = await reduceNoise(image, ratio);
        let cnts = await detectEdges(processedImage);
        const screenCnt = identifyTargetObject(cnts);
        let wrapped = await fourPointTransform(origin, scalePoints(screenCnt, ratio));
        return await cv.imwriteAsync(`./assets/processed.jpg`, wrapped);
    }
}

async function reduceNoise(image, ratio) {
    image = await image.resizeAsync(parseInt(image.sizes[0] / ratio), 500);
    let gray = await image.cvtColorAsync(cv.COLOR_BGR2GRAY);
    let blur = await gray.gaussianBlurAsync(new cv.Size(5, 5), 0);
    return blur.cannyAsync(75, 200);
}

async function detectEdges(processedImage) {
    let cnts = await processedImage.findContoursAsync(cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);
    return (cnts.length == 2) ? cnts[0] : (cnts.length == 3) ? cnts[1] : cnts;
}


function identifyTargetObject(cnts) {
    let screenCnt = [];
    cnts.sort(function (a, b) {
        return b.area - a.area;
    });
    for (let i = 0; i < 5; i++) {
        const peri = cnts[i].arcLength(true);
        const approx = cnts[i].approxPolyDP(0.02 * peri, true);
        if (approx.length === 4) {
            screenCnt = approx;
            break;
        }
    }
    return screenCnt;
}

function scalePoints(points, ratio) {
    return points.map(point => {
        const { x, y } = point;
        return new cv.Point2(x * ratio, y * ratio);
    });
}

async function fourPointTransform(origin, screenCnt) {
    const rect = orderPoint(screenCnt);
    const width = getWidth(rect);
    const height = getHeight(rect);

    const dst = [
        new cv.Point2(0, 0),
        new cv.Point2(width - 1, 0),
        new cv.Point2(width - 1, height - 1),
        new cv.Point2(0, height - 1)
    ];

    const transformMatrix = cv.getPerspectiveTransform(rect, dst);
    return origin.warpPerspectiveAsync(transformMatrix, new cv.Size(width, height));
}

function orderPoint(pts) {
    pts.sort(compareByXAxis);
    const leftPoints = pts.slice(0, 2);
    const rightPoints = pts.slice(2, 4);

    leftPoints.sort(compareByYAxis);
    rightPoints.sort(compareByYAxis);
    return [leftPoints[0], rightPoints[0], rightPoints[1], leftPoints[1]];
}

function compareByXAxis(e1, e2) {
    return e1.x - e2.x;
}

function compareByYAxis(e1, e2) {
    return e1.y - e2.y;
}

function getWidth(rect) {
    const [tr, tl, br, bl] = rect;
    const widthA = calculateDistance(tr, tl);
    const widthB = calculateDistance(br, bl);
    return Math.max(widthA, widthB);;
}

function getHeight(rect) {
    const [tr, tl, br, bl] = rect;
    const heightA = calculateDistance(tr, br);
    const heightB = calculateDistance(tl, bl);
    return Math.max(heightA, heightB);
}


function calculateDistance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

