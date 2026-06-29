const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const skills = require("./skills");
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const app = express();

// Server can talk to Gemini
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

app.use(cors());
app.use(express.json());

const upload = multer({
    dest: "uploads/"
});

function escapeRegex(text){
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function createSkillRegex(skill){
    const escapedSkill = escapeRegex(skill);

    return new RegExp(`(^|\\s|,|\\.|;|:)${escapedSkill}($|\\s|,|\\.|;|:)`, "i");
}

function calculateATSScore(resumeText, jobMatchPercentage){
    let score = 0;
    const text = resumeText.toLowerCase();

    const hasEmail = /\S+@\S+\.\S+/.test(resumeText);
    const hasPhone = /(\+?\d[\d\s\-()]{8,}\d)/.test(resumeText);

    if(hasEmail) score += 5;
    if(hasPhone) score += 5;
    if(text.includes("education") || text.includes("bachelor") || text.includes("engineering")) score += 10; 
    if(text.includes("skills") || text.includes("programming")) score += 15;
    if(text.includes("project") || text.includes("projects")) score += 20;

    const actionWords = ["developed", "built", "implemented", "designed", "created", "managed", "optimized"];
    let actionCount = 0;
    for(let word of actionWords){
        if(text.includes(word)) actionCount++;
    }
    score += Math.min(actionCount * 3, 15);

    const wordCount = resumeText.split(/\s+/).length;
    if(wordCount >= 300 && wordCount <= 1500) score += 10;
    
    score += Math.round(jobMatchPercentage * 0.2);
    return Math.min(score, 100);
}

function analyzeResume(resumeText, jobDescription){
    const matchedSkills = [];
    const missingSkills = [];

    for(let skill of skills){
        const skillRegex = createSkillRegex(skill);
        const skillInJD = skillRegex.test(jobDescription);

        if(skillInJD){
            const skillInResume = skillRegex.test(resumeText);
            if(skillInResume){
                matchedSkills.push(skill);
            } else {
                missingSkills.push(skill);
            }
        }
    }
    
    const jobMatchPercentage = matchedSkills.length + missingSkills.length === 0 ? 0 : Math.round((matchedSkills.length / (matchedSkills.length + missingSkills.length)) * 100);

    const atsScore = calculateATSScore(resumeText, jobMatchPercentage);

    return {
        atsScore,
        jobMatchPercentage,
        matchedSkills,
        missingSkills
    };
}

async function generateAISuggestions(resumeText, companyName, jobTitle, experienceLevel, jobDescription, matchedSkills, missingSkills, score){
    const prompt = `
        You are an expert ATS reviewer and technical recruiter.
        Candidate Information:
        Company Name: ${companyName}
        Job Title: ${jobTitle}
        Experience Level: ${experienceLevel}
        ATS Score: ${score}%
        Matched Skills: ${matchedSkills.join(", ")}
        Missing Skills: ${missingSkills.join(", ")}
        Job Description: ${jobDescription}
        Resume: ${resumeText}

        Analyze the candidate thoroughly.
        Return ONLY valid JSON.
        {
          "strengths": ["..."],
          "weaknesses": ["..."],
          "suggestions": ["..."],
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
        Requirements:
        - Generate as many strengths as genuinely applicable.
        - Generate as many areas for improvement as genuinely applicable.
        - Generate as many suggestions as genuinely applicable.
        - Do not limit the number of items.
        - Base the analysis on the resume, job description, company, role and experience level.
        - Return JSON only.
    `;

    try {
        const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json"
        }
    });
    const cleanedText = response.text.trim();

    return JSON.parse(cleanedText);
    } catch(error){
        console.error("Gemini Error:", error);
        
        return {
            strengths: ["AI analysis unavailable"],
            weaknesses: ["AI analysis unavailable"],
            suggestions: ["Please try again after some time."],
            recommendation: "AI unavailable",
            recommendationReason: "Gemini service is currently experiencing high demand."
        };
    }
}

app.get("/", (req, res) =>{
    res.send("Backend Running");
});

app.post("/upload", upload.single("resume"), async (req, res) => {
    try {
        const pdfBuffer = fs.readFileSync(req.file.path);

        const data = await pdfParse(pdfBuffer);

        res.json({
            extractedText: data.text
        });
    } catch(error){
        console.error(error);

        res.status(500).json({
            message: "Error extracting PDF"
        });
    }
});

app.post("/analyze", (req, res) => {
    const {resumeText, jobDescription} = req.body;
    
    const result = analyzeResume(resumeText, jobDescription);

    res.json(result);
});

app.post("/analyze-resume", upload.single("resume"), async (req, res) => {
    let filePath;
    try {
        // console.log("Analyze Resume API Hit...");
        const {companyName, jobTitle, experienceLevel, jobDescription} = req.body;

        if(!req.file){
            return res.status(400).json({message: "Resume file is required"});
        }
        filePath = req.file.path;
        const pdfBuffer = fs.readFileSync(req.file.path);
        const data = await pdfParse(pdfBuffer);

        const resumeText = data.text;

        const safeJobDescription = (jobDescription || "").toString();
        const result = analyzeResume(resumeText, safeJobDescription);

        console.log("Calling Gemini AI for deeper analysis...");
        const aiSuggestions = await generateAISuggestions(resumeText, companyName, jobTitle, experienceLevel, safeJobDescription, result.matchedSkills, result.missingSkills, result.atsScore);

        // const aiSuggestions = {
        //     strengths: ["Test Strength"],
        //     weaknesses: ["Test Weakness"],
        //     suggestions: ["Test Suggestion"],
        //     recommendation: "Strong Match",
        //     recommendationReason: "Test Reason"
        // };

        res.json({
            // extractedText: resumeText,
            ...result,
            ...aiSuggestions
        });
    } catch(error){
        console.error("Route error:", error);

        res.status(500).json({
            message: "Error analyzing resume"
        });
    } finally{
        if(filePath && fs.existsSync(filePath)){
            // Delete uploaded pdf
            fs.unlinkSync(filePath);
        }
    }
});


app.get("/test-ai", async (req, res) => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Say Hello to Zoha"
        });

        res.json({
            reply: response.text
        });
    } catch(error){
        console.error(error);
        res.status(500).json({
            message: "AI Error"
        });
    }
});

app.listen(5000, () =>{
    console.log("Server running on port 5000");
});