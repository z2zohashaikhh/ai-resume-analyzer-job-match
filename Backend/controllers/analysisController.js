const {
    extractResumeText
} = require("../services/resumeParserService");

const {
    uploadResumeToCloudinary
} = require("../services/cloudinaryService");

const {
    extractAndMatchSkills
} = require("../services/skillMatchingService");

const {
    calculateATSScore
} = require("../services/atsScoringService");

const {
    generateAIAnalysis
} = require("../services/aiAnalysisService");

async function analyzeResume(req, res){
    try {
        const {
            companyName,
            jobTitle,
            experienceLevel,
            jobDescription
        } = req.body;

        if(!req.file){
            return res.status(400).json({
                message: "Resume file is required."
            });
        }

        if(!jobDescription?.trim()){
            return res.status(400).json({
                message: "Job description is required."
            });
        }

        const cloudinaryResult = await uploadResumeToCloudinary(req.file.buffer, req.file.originalname);

        const resumeText = await extractResumeText(req.file.buffer);

        const skillResult = await extractAndMatchSkills(resumeText, jobDescription);

        const totalRelevantSkills = skillResult.matchedSkills.length + skillResult.missingSkills.length;

        const jobMatchPercentage = totalRelevantSkills === 0 ? 0 : Math.round((skillResult.matchedSkills.length / totalRelevantSkills) * 100);

        const atsScore = calculateATSScore({resumeText, jobMatchPercentage});

        const aiAnalysis = await generateAIAnalysis({
            resumeText,
            companyName,
            jobTitle,
            experienceLevel,
            jobDescription,
            matchedSkills: skillResult.matchedSkills,
            missingSkills: skillResult.missingSkills,
            atsScore,
            jobMatchPercentage
        });
        
        return res.json({
            atsScore,
            jobMatchPercentage,

            matchedSkills: skillResult.matchedSkills,
            missingSkills: skillResult.missingSkills,

            resumeSkills: skillResult.resumeSkills,
            jobSkills: skillResult.jobSkills,

            ...aiAnalysis,

            resumeURL: cloudinaryResult.url
        });

    } catch (error) {
        console.error("Analysis controller error:", error);

        return res.status(500).json({
            message: "Error analyzing resume."
        });
    }
}

module.exports = {
    analyzeResume,
};