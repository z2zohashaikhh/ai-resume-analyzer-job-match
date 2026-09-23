function calculateATSScore({resumeText, jobMatchPercentage}){
    let score = 0;
    const text = resumeText.toLowerCase();

    // Contact information
    const hasEmail = /\S+@\S+\.\S+/.test(resumeText);
    const hasPhone = /(\+?\d[\d\s\-()]{8,}\d)/.test(resumeText);

    if(hasEmail){
        score += 5;
    }
    if(hasPhone){
        score += 5;
    }

    // Resume sections
    if(text.includes("education") || text.includes("bachelor") || text.includes("engineering") || text.includes("degree")){
        score += 10;
    }
    if(text.includes("skills") || text.includes("technical skills") || text.includes("technologies")){
        score += 15;
    }
    if(text.includes("project") || text.includes("projects")){
        score += 20;
    }

    // Action verbs
    const actionWords = ["developed", "built", "implemented", "designed", "created", "managed", "optimized", "automated", "engineered", "deployed"];

    let actionCount = 0;

    for(const word of actionWords){
        if(text.includes(word)){
            actionCount++;
        }
    }

    score += Math.min(actionCount * 3, 15);

    // Resume length
    const wordCount = resumeText.split(/\s+/).filter(Boolean).length;

    if(wordCount >= 300 && wordCount <= 1500){
        score += 10;
    }

    // Job relevance
    score += Math.round(jobMatchPercentage * 0.2);
    return Math.min(score, 100);
}

module.exports = {
    calculateATSScore,
};