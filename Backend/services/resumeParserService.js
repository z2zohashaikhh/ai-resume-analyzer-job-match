const pdfParse = require("pdf-parse");

async function extractResumeText(pdfBuffer) {
    if(!pdfBuffer){
        throw new Error("Resume PDF buffer is missing.");
    }
    const data = await pdfParse(pdfBuffer);
    return data.text.trim();
}

module.exports = {
    extractResumeText,
};