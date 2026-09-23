document.addEventListener("DOMContentLoaded", () => {
    const storedResult = sessionStorage.getItem("analysisResult");
    if(!storedResult){
        alert("No analysis data found. Please analyze a resume first.");
        window.location.href = "index.html";
        return;
    }

    let result;
    try {
        result = JSON.parse(storedResult);

    } catch(error) {
        console.error("Unable to parse analysis result:", error);
        alert("The analysis data is invalid. Please analyze the resume again.");
        sessionStorage.removeItem("analysisResult");
        window.location.href = "index.html";
        return;
    }

    const getElement = (id) => {
        const element = document.getElementById(id);
        if(!element){
            console.warn(`Element with id "${id}" was not found.`);
        }
        return element;
    };
    const resumeViewer = getElement("resumeViewer");
    const resumeURL = result.resumeURL;
    if(resumeViewer && resumeURL){
        resumeViewer.src = resumeURL;
    } else {
        console.error("Resume viewer or Cloudinary resume URL is missing.");
        if(resumeViewer){
            resumeViewer.removeAttribute("src");
        }
    }

    // ATS Score
    const atsScoreElement = getElement("atsScore");

    if(atsScoreElement){
        atsScoreElement.textContent = result.atsScore ?? 0;
    }

    const atsMessage = getElement("atsMessage");
    if(atsMessage){
        const atsScore = Number(result.atsScore) || 0;
        if(atsScore >= 80){
            atsMessage.textContent = "Excellent ATS compatibility. Your resume matches most job requirements.";
        } else if(atsScore >= 60) {
            atsMessage.textContent = "Good ATS compatibility. Some improvements can increase your chances.";
        } else {
            atsMessage.textContent = "Your resume needs optimization to improve ATS performance.";
        }
    }

    // Job Percentage
    const jobMatchElement = getElement("jobMatchPercentage");
    if(jobMatchElement){
        jobMatchElement.textContent = `${result.jobMatchPercentage ?? 0}%`;
    }

    // Recommendation
    const recommendationContainer = getElement("recommendationContainer");
    if(recommendationContainer){
        const recommendation = result.recommendation || "";
        if(recommendation === "Strong Match"){
            recommendationContainer.innerHTML = `
                <div class="strong-status">
                    <i class="fa-solid fa-circle strong"></i>
                    Strong Match
                </div>
            `;

        } else if(recommendation === "Moderate Match"){
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
    }

    // Recommendation Reason
    const recommendationReason = getElement("recommendationReason");
    if(recommendationReason){
        recommendationReason.textContent = result.recommendationReason || "No recommendation reason was generated.";
    }

    // Matched Skills
    const matchedSkillsContainer = getElement("matchedSkills");
    if(matchedSkillsContainer){
        matchedSkillsContainer.innerHTML = "";
        const matchedSkills = Array.isArray(result.matchedSkills) ? result.matchedSkills : [];

        if(matchedSkills.length === 0){
            const emptyMessage = document.createElement("span");
            emptyMessage.classList.add("chip");
            emptyMessage.textContent = "None identified";
            matchedSkillsContainer.appendChild(emptyMessage);
        } else{
            matchedSkills.forEach(skill => {
                const chip = document.createElement("span");
                chip.classList.add("chip", "success");
                chip.textContent = skill;
                matchedSkillsContainer.appendChild(chip);
            });
        }
    }

    // Missing Skills
    const missingSkillsContainer = getElement("missingSkills");
    if(missingSkillsContainer){
        missingSkillsContainer.innerHTML = "";
        const missingSkills = Array.isArray(result.missingSkills) ? result.missingSkills : [];
        if(missingSkills.length === 0){
            const emptyMessage = document.createElement("span");
            emptyMessage.classList.add("chip");
            emptyMessage.textContent = "None identified";
            missingSkillsContainer.appendChild(emptyMessage);
        } else{
            missingSkills.forEach(skill => {
                const chip = document.createElement("span");
                chip.classList.add("chip", "danger");
                chip.textContent = skill;
                missingSkillsContainer.appendChild(chip
                );
            });
        }
    }

    // Strengths
    const strengthsList = getElement("strengths");
    if(strengthsList){
        strengthsList.innerHTML = "";
        const strengths = Array.isArray(result.strengths) ? result.strengths : [];
        strengths.forEach(strength => {
            const li = document.createElement("li");
            li.textContent = strength;
            strengthsList.appendChild(li);
        });
    }

    // Weakness
    const weaknessesList = getElement("weaknesses");
    if(weaknessesList){
        weaknessesList.innerHTML = "";
        const weaknesses = Array.isArray(result.weaknesses) ? result.weaknesses : [];
        weaknesses.forEach(weakness => {
            const li = document.createElement("li");
            li.textContent = weakness;
            weaknessesList.appendChild(li);
        });
    }

    // Suggestions
    const suggestionsList = getElement("suggestions");
    if(suggestionsList){
        suggestionsList.innerHTML = "";
        const suggestions = Array.isArray(result.suggestions) ? result.suggestions : [];
        suggestions.forEach(suggestion => {
            const li = document.createElement("li");
            li.textContent = suggestion;
            suggestionsList.appendChild(li);
        });
    }

    // Download Report
    const downloadBtn = getElement("downloadBtn");
    if(downloadBtn){
        downloadBtn.addEventListener("click", () => {
            if(typeof generateReport === "function"){
                generateReport(result);
            } else{
                console.error("generateReport() is not available. Check report.js.");
                alert("PDF report generator could not be loaded. Please refresh the page.");
            }
        });
    }
});