const ocrService = require('../services/ocr');

module.exports = {
    recoginze: async function (req, res, next) {

        await ocrService.scanTargetObject('./assets/card12.jpg');
        // const text = await ocrService.recognize({
        //     sourceUrl: `./assets/processed6.jpg`,
        //     sourceLanguage: 'eng'
        // });

        res.send("text");
    }
}