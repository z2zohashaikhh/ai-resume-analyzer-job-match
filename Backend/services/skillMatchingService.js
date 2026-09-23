const ai = require("../config/gemini");
function wait(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateWithRetry(prompt, maxRetries = 3){
    for(let attempt = 0; attempt <= maxRetries; attempt++){
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json"
                }
            });
            return response;
        } catch(error) {
            const status = error?.status;
            console.error(
                `Gemini skill matching attempt ${attempt + 1} failed. Status: ${status || "Unknown"}`
            );
            // Retry only for temporary Gemini/API availability problems
            if(status !== 503 && status !== 429){
                throw error;
            }
            // No retries left
            if(attempt === maxRetries){
                throw error;
            }
            // Exponential backoff:
            // Attempt 1 → 1 second
            // Attempt 2 → 2 seconds
            // Attempt 3 → 4 seconds
            const delay = 1000 * Math.pow(2, attempt);
            await wait(delay);
        }
    }
}

async function extractAndMatchSkills(resumeText, jobDescription) {
    const prompt = `
    You are a technical recruitment and resume analysis engine.
    Analyze the following resume and job description.
    RESUME: ${resumeText}
    JOB DESCRIPTION: ${jobDescription}
    Return ONLY valid JSON in exactly this structure:

    {
        "resumeSkills": [],
        "jobSkills": [],
        "matchedSkills": [],
        "missingSkills": []
    }

    Rules:
    1. Extract only genuine technical, software, engineering, data, cloud,
    database, development, testing, methodology, and professional skills.
    2. Do not include generic words such as:
    "communication", "teamwork", "hardworking", "leadership"
    unless they are explicitly important technical/professional requirements.
    3. Normalize equivalent skill names.
    Examples:
    "JS" -> "JavaScript"
    "Node" -> "Node.js"
    "REST APIs" -> "REST API"
    "Postgres" -> "PostgreSQL"
    4. Do not invent skills that are not present.
    5. matchedSkills must contain skills that are present in both
    the resume and job description.
    6. missingSkills must contain skills required by the job description
    that are not present in the resume.
    7. Avoid duplicate skills.
    8. Preserve commonly recognized technology names.
    9. Return JSON only.
    `;
    const response = await generateWithRetry(prompt);
    const result = JSON.parse(response.text.trim());
    return {
        resumeSkills: result.resumeSkills || [],
        jobSkills: result.jobSkills || [],
        matchedSkills: result.matchedSkills || [],
        missingSkills: result.missingSkills || []
    };
}

module.exports = {
    extractAndMatchSkills,
};