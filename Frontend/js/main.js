const API_BASE_URL = "http://localhost:5000";
document.addEventListener("DOMContentLoaded", () => {
    const analyzeBtn = document.getElementById("analyzeBtn");
    const loadingOverlay = document.getElementById("loadingOverlay");

    if(!analyzeBtn){
        console.error("Analyze button not found.");
        return;
    }

    analyzeBtn.addEventListener("click", async () => {
        try {
            const companyName = document.getElementById("companyName").value.trim();
            const jobTitle = document.getElementById("jobTitle").value.trim();
            const experienceLevel = document.getElementById("experience").value;
            const jobDescription = document.getElementById("jobDescription").value.trim();
            const resumeInput = document.getElementById("resume");
            const resume = resumeInput.files[0];
            
            // Validation
            if(!companyName || !jobTitle || !experienceLevel || !jobDescription || !resume){
                alert("Please fill in all fields and upload a resume PDF.");
                return;
            }

            if(resume.type !== "application/pdf"){
                alert("Please upload a PDF resume.");
                return;
            }

            if(resume.size > 5 * 1024 * 1024){
                alert("Resume size must be less than 5 MB.");
                return;
            }

            if(loadingOverlay){
                loadingOverlay.style.display = "flex";
            }

            const formData = new FormData();
            formData.append("companyName", companyName);
            formData.append("jobTitle", jobTitle);
            formData.append("experienceLevel", experienceLevel);
            formData.append("jobDescription", jobDescription);
            formData.append("resume", resume);

            const response = await fetch(`${API_BASE_URL}/analyze-resume`, {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            // Handle backend error
            if(!response.ok){
                if(loadingOverlay){
                    loadingOverlay.style.display = "none";
                }
                alert(result.message || "Unable to analyze the resume.");
                return;
            }

            // Validate response
            if(!result.resumeURL){
                if(loadingOverlay){
                    loadingOverlay.style.display = "none";
                }
                alert("Resume was analyzed, but the Cloudinary URL was not returned.");
                return;
            }

            // Store analysis result
            sessionStorage.setItem("analysisResult", JSON.stringify(result));
            
            // Navigate to review page
            window.location.href = "review.html";

        } catch(error){
            console.error("CareerLens AI request failed:", error);
            if(loadingOverlay){
                loadingOverlay.style.display = "none";
            }
            alert("Could not connect to the CareerLens AI server. Please try again.");
        }
    });
});