# 🤖 AI Resume Analyzer & Job Match

<p align="center">
  <img src="Frontend/CareerLensAI.png" alt="CareerLensAI Logo" width="180">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white">
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white">
  <img src="https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white">
</p>

<p align="center">
  <b>An AI-powered Resume Analyzer that compares resumes with job descriptions and generates ATS insights using Google Gemini.</b>
</p>

---

## 📌 Overview

AI Resume Analyzer & Job Match helps job seekers evaluate how well their resume aligns with a specific job description.

The application extracts text from PDF resumes, analyzes it against the provided job description, calculates an ATS score, identifies matched and missing skills, and generates personalized AI feedback using Google Gemini.

---

## ✨ Features

- 📄 Upload Resume (PDF)
- 🤖 AI-powered Resume Analysis
- 📊 ATS Score Calculation
- 🎯 Job Match Percentage
- ✅ Matched Skills Detection
- ❌ Missing Skills Detection
- 💪 Resume Strength Analysis
- ⚠️ Weakness Identification
- 💡 Personalized AI Suggestions
- 🏆 Hiring Recommendation
- 🗑️ Automatic Cleanup of Uploaded Files

---

## 🛠️ Tech Stack

### Frontend

- HTML5
- CSS3
- JavaScript

### Backend

- Node.js
- Express.js

### AI

- Google Gemini API

### Libraries

- Multer
- pdf-parse
- dotenv
- cors

---

## 📂 Project Structure

```text
AI-Resume-Analyzer-Job-Match
│
├── Backend
│   ├── server.js
│   ├── skills.js
│   ├── package.json
│   ├── package-lock.json
│   └── .env
│
├── Frontend
│   ├── index.html
│   ├── review.html
│   ├── script.js
│   ├── review.js
│   ├── style.css
│   ├── review.css
│   └── CareerLensAI.png
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Clone the Repository

```bash
git clone https://github.com/z2zohashaikhh/ai-resume-analyzer-job-match.git
```

### Go to Backend

```bash
cd Backend
```

### Install Dependencies

```bash
npm install
```

### Create a `.env` File

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

### Start the Server

```bash
node server.js
```

The backend runs on:

```text
http://localhost:5000
```

Open `Frontend/index.html` in your browser.

---

## 🌐 Live Demo

> 🚧 Coming Soon

The project will be deployed after the planned AI and ATS improvements are completed.

---

## 📸 Screenshots

> Screenshots will be added soon.

---

## 🔮 Planned Improvements

- AI-based Skill Extraction
- Improved ATS Scoring Algorithm
- Resume Section-wise Analysis
- Better Resume Formatting Analysis
- Responsive UI
- Live Deployment
- Enhanced User Experience

---

## 🤝 Contributing

Contributions, suggestions, and feedback are welcome.

Feel free to fork the repository and submit a pull request.

---

## 👩‍💻 Author

**Zoha Shaikh**

GitHub: **https://github.com/z2zohashaikhh**

---

## ⭐ Support

If you found this project helpful, consider giving it a ⭐ on GitHub.
