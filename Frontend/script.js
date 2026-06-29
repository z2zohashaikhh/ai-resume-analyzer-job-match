document.addEventListener("DOMContentLoaded", () => {
    console.log("SCRIPT LOADED");

    // Target the button directly instead of the form
    const analyzeBtn = document.getElementById("analyzeBtn");
    const loadingOverlay = document.getElementById("loadingOverlay");

    if (!analyzeBtn) {
        console.error("analyzeBtn not found in the DOM");
        return;
    }

    analyzeBtn.addEventListener("click", async () => {
        console.log("BUTTON CLICKED - STARTING PROCESS");

        try {
            const companyName = document.getElementById("companyName").value;
            const jobTitle = document.getElementById("jobTitle").value;
            const experienceLevel = document.getElementById("experience").value;
            const jobDescription = document.getElementById("jobDescription").value;
            const resumeInput = document.getElementById("resume");
            const resume = resumeInput.files[0];

            // Manually check validity since we aren't using HTML5 native submit validation
            if (!companyName || !jobTitle || !experienceLevel || !jobDescription || !resume) {
                alert("Please fill in all fields and upload a resume PDF.");
                return;
            }

            // Show loading overlay once validation passes
            if (loadingOverlay) {
                loadingOverlay.style.display = "flex";
            }

            // Create FormData layout 
            const formData = new FormData();
            formData.append("companyName", companyName);
            formData.append("jobTitle", jobTitle);
            formData.append("experienceLevel", experienceLevel);
            formData.append("jobDescription", jobDescription);
            formData.append("resume", resume);

            console.log("Sending network request to backend server...");
            
            const response = await fetch("http://localhost:5000/analyze-resume", {
                method: "POST",
                body: formData
            });

            console.log("Response status received:", response.status);
            const result = await response.json();

            if (!response.ok) {
                // Hide overlay if server responses with error
                if (loadingOverlay) loadingOverlay.style.display = "none";
                alert(result.message || "Server encountered an error processing your request.");
                return;
            }

            console.log("Analysis successful! Storing details...", result);
            
            // 1. Store the AI analysis results JSON object
            sessionStorage.setItem("analysisResult", JSON.stringify(result));

            // 2. Convert PDF to Base64 data string to persist across page routing boundaries
            const reader = new FileReader();
            reader.onloadend = function () {
                const base64String = reader.result;
                sessionStorage.setItem("resumeBase64", base64String);
                
                console.log("Resume encoded successfully. Navigating to dashboard...");
                
                // 3. Redirect to your review presentation sheet ONLYYYY after string is stored
                // (The loader will close naturally as the page changes)
                window.location.href = "review.html";
            };

            // Trigger the reader
            reader.readAsDataURL(resume);

        } catch (error) {
            // Hide overlay if exception occurs
            if (loadingOverlay) {
                loadingOverlay.style.display = "none";
            }
            console.error("Network or execution failed:", error);
            alert("Could not connect to the backend server. Make sure your server node is running on port 5000.");
        }
    });
});