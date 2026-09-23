function generateReport(result){
    if(!result){
        console.error("No analysis result available for PDF generation.");
        return;
    }

    if(!window.jspdf || !window.jspdf.jsPDF){
        console.error("jsPDF library is not loaded.");
        alert("PDF generator could not be loaded. Please refresh the page.");
        return;
    }

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
    });

    let yPos = 55;

    const applyPremiumBackground = (pdfDoc) => {
        for(let i = 0; i <= 297; i++){
            const ratio = i / 297;
            let r;
            let g;
            let b;

            if(ratio < 0.5){
                const localRatio = ratio / 0.5;
                r = Math.floor(2 + (15 - 2) * localRatio);
                g = Math.floor(8 + (23 - 8) * localRatio);
                b = Math.floor(23 + (42 - 23) * localRatio);
            } else{
                const localRatio = (ratio - 0.5) / 0.5;
                r = Math.floor(15 + (30 - 15) * localRatio);
                g = Math.floor(23 + (41 - 23) * localRatio);
                b = Math.floor(42 + (59 - 42) * localRatio);
            }
            pdfDoc.setFillColor(r, g, b);
            pdfDoc.rect(0, i, 210, 1, "F");
        }
    };

    applyPremiumBackground(doc);
    try {
        doc.addImage("images/CareerLensAI.png", "PNG", 12, 5, 54, 32);
    } catch(error) {
        console.warn("CareerLens AI logo could not be loaded.", error);
    }

    doc.setTextColor(255, 255, 255);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.text("CareerLens AI Analysis", 74, 19);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} | Smart Feedback Engine`, 74, 27);
    doc.setFillColor(15, 23, 42);
    doc.rect(15, yPos, 55, 25, "F");
    doc.rect(77, yPos, 55, 25, "F");
    doc.rect(140, yPos, 55, 25, "F");
    
    // ATS Score
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text("ATS MATCH SCORE", 20, yPos + 8);
    doc.setFontSize(16);
    doc.setTextColor(255, 87, 34);
    doc.text(`${result.atsScore || 0} / 100`, 20, yPos + 18);
    // Job Match Score
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text("JOB MATCH SCORE", 82, yPos + 8);
    doc.setFontSize(16);
    doc.setTextColor(38, 166, 154);
    doc.text(`${result.jobMatchPercentage || 0}%`, 82, yPos + 18);
    // Evaluation
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text("EVALUATION", 145, yPos + 8);
    doc.setFontSize(13);
    if((result.recommendation || "").includes("Strong")){
        doc.setTextColor(74, 222, 128);
    } else if(
        (result.recommendation || "").includes("Moderate")
    ){
        doc.setTextColor(251, 191, 36);
    } else{
        doc.setTextColor(248, 113, 113);
    }
    doc.text(result.recommendation || "Evaluated", 145, yPos + 18);
    yPos += 38;

    // Page Break
    const ensurePageSpace = (requiredSpace = 15) => {
        if(yPos + requiredSpace > 275){
            doc.addPage();
            applyPremiumBackground(doc);
            yPos = 25;
        }
    };

    const drawSectionHeader = (title) => {
        ensurePageSpace(20);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.text(title, 15, yPos);
        doc.setDrawColor(51, 65, 85);
        doc.setLineWidth(0.4);
        doc.line(15, yPos + 2, 195, yPos + 2);
        yPos += 10;
    };

    const printWrappedText = (text, startX, maxW, lineH, colorArray = [241, 245, 249]) => {
        if(text === null || text === undefined || text === ""){
            return;
        }
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(colorArray[0], colorArray[1], colorArray[2]);
        const lines = doc.splitTextToSize(String(text), maxW);
        lines.forEach(line => {
            ensurePageSpace(lineH + 2);
            doc.text(line, startX, yPos);
            yPos += lineH;
        });
    };

    // Skills Chips
    const drawSkillChips = (skillsArray, badgeType) => {
        let currentX = 15;
        const rowSpacing = 8;
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9.5);
        if(!skillsArray || skillsArray.length === 0){
            printWrappedText("None specified", 15, 180, 5.5, [148, 163, 184]);
            return;
        }
        skillsArray.forEach(skill => {
            const skillText = String(skill);
            const textWidth = doc.getTextWidth(skillText);
            const boxW = textWidth + 6;
            const boxH = 6;
            // New row
            if(currentX + boxW > 195){
                currentX = 15;
                yPos += rowSpacing;
            }

            // Make sure chip has room
            ensurePageSpace(10);
            if(badgeType === "success"){
                doc.setFillColor(22, 101, 52);
                doc.setTextColor(187, 247, 208);
            } else{
                doc.setFillColor(153, 27, 27);
                doc.setTextColor(254, 226, 226);
            }
            doc.roundedRect(currentX, yPos - 4, boxW, boxH, 1.5, 1.5, "F");
            doc.text(skillText, currentX + 3, yPos
            );
            currentX += boxW + 3;
        });
        yPos += rowSpacing + 2;
    };

    //1. Hiring Analysis Summary
    drawSectionHeader("Hiring Analysis Summary");
    printWrappedText(result.recommendationReason || "No summary profile parsing insights recorded.", 15, 180, 5.5);
    yPos += 5;

    // 2.Technical Skills
    drawSectionHeader("Technical Key Skills Assessment");
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(74, 222, 128);
    doc.text("Matched Skills (Identified on Resume):", 15, yPos);
    yPos += 6;
    drawSkillChips(result.matchedSkills || [], "success");
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(248, 113, 113);
    doc.text("Missing Critical Skills (Recommended to Add):", 15, yPos);
    yPos += 6;
    drawSkillChips(result.missingSkills || [], "danger");
    yPos += 2;

    // 3. Strengths
    drawSectionHeader("Identified Strengths");
    const strengths = result.strengths || [];
    if(strengths.length === 0){
        printWrappedText("No specific strengths were identified.", 24, 171, 5.5, [148, 163, 184]);
    } else{
        strengths.forEach(strength => {
            ensurePageSpace(15);
            doc.setFillColor(74, 222, 128);
            doc.circle(18, yPos - 1.5, 1, "F");
            printWrappedText(strength, 24, 171, 5.5, [255, 255, 255]);
            yPos += 2.5;
        });
    }

    yPos += 2;

    // 4. Areas for Improvement
    drawSectionHeader("Areas for Improvement");
    const weaknesses = result.weaknesses || [];
    if(weaknesses.length === 0){
        printWrappedText("No specific improvement areas were identified.", 24, 171, 5.5, [148, 163, 184]);
    } else{
        weaknesses.forEach(weakness => {
            ensurePageSpace(15);
            doc.setFillColor(248, 113, 113);
            doc.circle(18, yPos - 1.5, 1, "F");
            printWrappedText(weakness, 24, 171, 5.5, [255, 255, 255]);
            yPos += 2.5;
        });
    }
    yPos += 2;

    // 5.AI Suggestions
    drawSectionHeader("Targeted Action Plan & AI Suggestions");
    const suggestions = result.suggestions || [];
    if(suggestions.length === 0){
        printWrappedText("No additional suggestions were generated.", 22, 173, 5.5, [148, 163, 184]);
    } else{
        let index = 1;
        suggestions.forEach(suggestion => {
            ensurePageSpace(15);
            doc.setFont("Helvetica", "bold");
            doc.setFontSize(10);
            doc.setTextColor(255, 255, 255);
            doc.text(`${index}.`, 15, yPos);
            printWrappedText(suggestion, 22, 173, 5.5, [255, 255, 255]);
            yPos += 2.5;
            index++;
        });
    }

    // Save PDF
    const fileName = `CareerLens_Analysis_Report_${Date.now()}.pdf`;
    doc.save(fileName);
}