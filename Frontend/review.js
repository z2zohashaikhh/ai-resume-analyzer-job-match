document.addEventListener("DOMContentLoaded", () => {
    const result = JSON.parse(sessionStorage.getItem("analysisResult"));
    const resumeURL = sessionStorage.getItem("resumeURL");

    if(!result){
        alert("No analysis data found.");
        window.location.href = "index.html";
    }

    // resumePreview
    const resumeViewer = document.getElementById("resumeViewer");
    const resumeBase64 = sessionStorage.getItem("resumeBase64");
    if(resumeViewer && resumeBase64){
        // Inject the Base64 data string straight into the iframe src
        resumeViewer.src = resumeBase64;
    } else {
        console.error("Resume Preview element or stored URL is missing");
    }

    // ATS Score
    document.getElementById("atsScore").textContent = result.atsScore;
    const atsMessage = document.getElementById("atsMessage");
    if(result.atsScore >= 80) {
        atsMessage.textContent = "Excellent ATS compatibility. Your resume matches most job requirements.";
    } else if(result.atsScore >= 60) {
        atsMessage.textContent = "Good ATS compatibilty. Some improvements can increase your chances.";
    } else {
        atsMessage.textContent = "Your resume needs optimization to improve ATS performance.";
    }

    // Job Match %
    document.getElementById("jobMatchPercentage").textContent = result.jobMatchPercentage + "%";

    // Recommendation Container
    const recommendationContainer = document.getElementById("recommendationContainer");
    if(result.recommendation === "Strong Match"){
        recommendationContainer.innerHTML = `
            <div class="strong-status">
                <i class="fa-solid fa-circle strong"></i>
                Strong Match
            </div>
        `;
    } else if(result.recommendation === "Moderate Match"){
        recommendationContainer.innerHTML = `
            <div class="moderate-status">
                <i class="fa-solid fa-circle moderate"></i>
                Moderate Match
            </div>
        `;
    } else{
        recommendationContainer.innerHTML = `
            <div class="low-status">
                <i class="fa-solid fa-circle low"></i>
                Low Match
            </div>
        `;
    }

    // Recommendation Reason
    document.getElementById("recommendationReason").textContent = result.recommendationReason;

    // Matched Skills
    const matchedSkillsContainer = document.getElementById("matchedSkills");
    (result.matchedSkills || []).forEach(skill => {
        const chip = document.createElement("span");
        chip.classList.add("chip", "success");
        chip.textContent = skill;

        matchedSkillsContainer.appendChild(chip);
    });

    // Missing Skills
    const missingSkillsContainer = document.getElementById("missingSkills");
    (result.missingSkills || []).forEach(skill => {
        const chip = document.createElement("span");
        chip.classList.add("chip", "danger");
        chip.textContent = skill;

        missingSkillsContainer.appendChild(chip);
    });

    // Strengths
    const strengthsList = document.getElementById("strengths");
    (result.strengths || []).forEach(strength => {
        const li = document.createElement("li");
        li.textContent = strength;
        strengthsList.appendChild(li);
    });

    // Weaknesses
    const weaknessesList = document.getElementById("weaknesses");
    (result.weaknesses || []).forEach(weakness => {
        const li = document.createElement("li");
        li.textContent = weakness;
        weaknessesList.appendChild(li);
    });

    // Suggestions
    const suggestionsList = document.getElementById("suggestions");
    (result.suggestions || []).forEach(suggestion => {
        const li = document.createElement("li");
        li.textContent = suggestion;
        suggestionsList.appendChild(li);
    });

    const downloadBtn = document.getElementById("downloadBtn");
    if (downloadBtn) {
        downloadBtn.addEventListener("click", () => {
            console.log("Generating premium dark mode PDF report...");
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
            
            let yPos = 55; 

            const applyPremiumBackground = (pdfDoc) => {
                for (let i = 0; i <= 297; i++) {
                    let ratio = i / 297;
                    let r, g, b;
                    if (ratio < 0.5) {
                        let localRatio = ratio / 0.5;
                        r = Math.floor(2 + (15 - 2) * localRatio);
                        g = Math.floor(8 + (23 - 8) * localRatio);
                        b = Math.floor(23 + (42 - 23) * localRatio);
                    } else {
                        let localRatio = (ratio - 0.5) / 0.5;
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
                doc.addImage("/Frontend/CareerLensAI.png", "PNG", 12, 5, 54, 32);
            } catch (e) {
                try {
                    doc.addImage("CareerLensAI.png", "PNG", 12, 5, 54, 32);
                } catch(err) {
                    console.warn("Logo asset route skipped.", err);
                }
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

            // Box 1: ATS Score
            doc.setFont("Helvetica", "bold");
            doc.setFontSize(9);
            doc.setTextColor(148, 163, 184);
            doc.text("ATS MATCH SCORE", 20, yPos + 8);
            doc.setFontSize(16);
            doc.setTextColor(255, 87, 34); 
            doc.text(`${result.atsScore || 0} / 100`, 20, yPos + 18);

            // Box 2: Job Match Score
            doc.setFont("Helvetica", "bold");
            doc.setFontSize(9);
            doc.setTextColor(148, 163, 184);
            doc.text("JOB MATCH SCORE", 82, yPos + 8);
            doc.setFontSize(16);
            doc.setTextColor(38, 166, 154); 
            doc.text(`${result.jobMatchPercentage || 0}%`, 82, yPos + 18);

            // Box 3: Evaluation Status Box
            doc.setFont("Helvetica", "bold");
            doc.setFontSize(9);
            doc.setTextColor(148, 163, 184);
            doc.text("EVALUATION", 145, yPos + 8);
            doc.setFontSize(13);
            if ((result.recommendation || "").includes("Strong")) {
                doc.setTextColor(74, 222, 128); 
            } else if ((result.recommendation || "").includes("Moderate")) {
                doc.setTextColor(251, 191, 36); 
            } else {
                doc.setTextColor(248, 113, 113); 
            }
            doc.text(result.recommendation || "Evaluated", 145, yPos + 18);

            yPos += 38;

            const drawSectionHeader = (title) => {
                if (yPos > 260) {
                    doc.addPage();
                    applyPremiumBackground(doc);
                    yPos = 25;
                }
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
                doc.setFont("Helvetica", "normal");
                doc.setFontSize(10); 
                doc.setTextColor(colorArray[0], colorArray[1], colorArray[2]);
                const lines = doc.splitTextToSize(text, maxW);
                lines.forEach(line => {
                    if (yPos > 275) {
                        doc.addPage();
                        applyPremiumBackground(doc); 
                        yPos = 25;
                    }
                    doc.text(line, startX, yPos);
                    yPos += lineH;
                });
            };

            const drawSkillChips = (skillsArray, badgeType) => {
                let currentX = 15;
                let rowSpacing = 8;
                doc.setFont("Helvetica", "normal");
                doc.setFontSize(9.5); 
                
                if (!skillsArray || skillsArray.length === 0) {
                    printWrappedText("None specified", 15, 180, 5.5, [148, 163, 184]);
                    return;
                }

                skillsArray.forEach(skill => {
                    let textWidth = doc.getTextWidth(skill);
                    let boxW = textWidth + 6;
                    let boxH = 6;
                    
                    if (currentX + boxW > 195) {
                        currentX = 15;
                        yPos += rowSpacing;
                    }
                    
                    if (badgeType === "success") {
                        doc.setFillColor(22, 101, 52); 
                        doc.setTextColor(187, 247, 208); 
                    } else {
                        doc.setFillColor(153, 27, 27); 
                        doc.setTextColor(254, 226, 226); 
                    }
                    
                    doc.roundedRect(currentX, yPos - 4, boxW, boxH, 1.5, 1.5, "F");
                    doc.text(skill, currentX + 3, yPos);
                    currentX += boxW + 3;
                });
                
                yPos += rowSpacing + 2; 
            };
            
            // Summary Section
            drawSectionHeader("Hiring Analysis Summary");
            printWrappedText(result.recommendationReason || "No summary profile parsing insights recorded.", 15, 180, 5.5);
            yPos += 5;

            // Skills Sections
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

            // Strengths Section
            drawSectionHeader("Identified Strengths");
            (result.strengths || []).forEach(str => {
                if (yPos > 270) { doc.addPage(); applyPremiumBackground(doc); yPos = 25; }
                
                doc.setFillColor(74, 222, 128); 
                doc.circle(18, yPos - 1.5, 1, "F");
                
                printWrappedText(str, 24, 171, 5.5, [255, 255, 255]); 
                yPos += 2.5; 
            });
            yPos += 2;

            // Areas for Improvement Section
            drawSectionHeader("Areas for Improvement");
            (result.weaknesses || []).forEach(wk => {
                if (yPos > 270) { doc.addPage(); applyPremiumBackground(doc); yPos = 25; }
                
                doc.setFillColor(248, 113, 113); 
                doc.circle(18, yPos - 1.5, 1, "F");
                
                printWrappedText(wk, 24, 171, 5.5, [255, 255, 255]); 
                yPos += 2.5; 
            });
            yPos += 2;

            // AI Suggestions
            drawSectionHeader("Targeted Action Plan & AI Suggestions");
            let index = 1;
            (result.suggestions || []).forEach(sug => {
                if (yPos > 270) { doc.addPage(); applyPremiumBackground(doc); yPos = 25; }
                
                doc.setFont("Helvetica", "bold");
                doc.setFontSize(10);
                doc.setTextColor(255, 255, 255); 
                doc.text(`${index}.`, 15, yPos);
                
                printWrappedText(sug, 22, 173, 5.5, [255, 255, 255]); 
                yPos += 2.5; 
                index++;
            });

            doc.save(`CareerLens_Analysis_Report_${Date.now()}.pdf`);
        });
    } else {
        console.error("downloadBtn item not discovered on page layout map tree.");
    }
});