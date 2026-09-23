const ai = require("../config/gemini");
function wait(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

function cleanJsonResponse(text){
    let cleaned = text.trim();

    // Remove accidental markdown code fences
    cleaned = cleaned.replace(/^```json\s*/i, "");
    cleaned = cleaned.replace(/^```\s*/i, "");
    cleaned = cleaned.replace(/\s*```$/i, "");
    return cleaned.trim();
}

async function generateWithRetry(prompt, maxRetries = 2){
    for(let attempt = 0; attempt <= maxRetries; attempt++){
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json"
                }
            });
            const cleanedText = cleanJsonResponse(response.text);
            try {
                return JSON.parse(cleanedText);
            } catch(parseError) {
                console.error(`Gemini returned invalid JSON on attempt ${attempt + 1}.`);
                console.error("Gemini response:", cleanedText);
                if(attempt === maxRetries){
                    throw parseError;
                }
                const delay = 1000 * Math.pow(2, attempt);
                await wait(delay);
            }

        } catch(error) {
            const status = error?.status;

            // Retry temporary Gemini service errors
            if(status === 503 || status === 429){

                if(attempt === maxRetries){
                    throw error;
                }
                const delay = 1000 * Math.pow(2, attempt);
                await wait(delay);
                continue;
            }
            throw error;
        }
    }
}

async function generateAIAnalysis({resumeText, companyName, jobTitle, experienceLevel, jobDescription, matchedSkills, missingSkills, atsScore, jobMatchPercentage}){
    const prompt = `
    You are an expert ATS reviewer and technical recruiter.

    Candidate Information:
    Company Name: ${companyName}
    Job Title: ${jobTitle}
    Experience Level: ${experienceLevel}
    ATS Score: ${atsScore}%
    Job Match: ${jobMatchPercentage}%
    Matched Skills: ${matchedSkills.join(", ") || "None"}
    Missing Skills: ${missingSkills.join(", ") || "None"}

    JOB DESCRIPTION: ${jobDescription}
    RESUME: ${resumeText}
    Analyze the candidate thoroughly.
    Return ONLY valid JSON in exactly this structure:

    {
        "strengths": [],
        "weaknesses": [],
        "suggestions": [],
        "recommendation": "",
        "recommendationReason": ""
    }

    Rules:
    - recommendation must be exactly one of:
      "Strong Match"
      "Moderate Match"
      "Low Match"
    - recommendationReason must be one concise sentence.
    - Do not include markdown.
    - Do not include explanations outside JSON.
    - Generate only genuinely relevant strengths.
    - Generate only genuinely relevant weaknesses.
    - Generate practical and specific suggestions.
    - Do not invent experience, skills, certifications, or achievements.
    - Base the analysis on the actual resume and job description.
    - strengths must be an array of concise strings.
    - weaknesses must be an array of concise strings.
    - suggestions must be an array of concise strings.
    - recommendation must be a string.
    - recommendationReason must be a string.
    - Return JSON only.
    `;
    try {
        return await generateWithRetry(prompt);
    } catch(error) {
        console.error("Gemini analysis error:", error);
        return {
            strengths: ["AI analysis unavailable"],
            weaknesses: ["AI analysis unavailable"],
            suggestions: ["Please try again after some time."],
            recommendation: "Low Match",
            recommendationReason: "The AI analysis service is currently unavailable."
        };
    }
}

module.exports = {
    generateAIAnalysis,
};