# JobTailor

A resume ATS (Applicant Tracking System) analyzer that helps job seekers check how well their resumes match specific job descriptions. Upload your resume, paste a job description, and get an ATS compatibility score with actionable suggestions.

## Features

- **Resume Parsing**: Extract text from PDF and DOCX resume files
- **Job Description Analysis**: Parse job postings to identify required skills, qualifications, and keywords
- **ATS Score Calculation**: Calculate compatibility scores based on keyword matching
- **Keyword Comparison**: See which keywords match and which are missing
- **Job Title Comparison**: Compare your resume title with the target role
- **Improvement Suggestions**: Get actionable tips to improve your resume

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Validation**: Zod
- **File Processing**: pdf-parse, mammoth, docx, jszip

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **HTTP Client**: Axios

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/JobTailor.git
cd JobTailor

# Install dependencies
npm install
```

### Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

Then open **http://localhost:3000** in your browser.

### Production Build

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npx serve -s build
```

## How It Works

1. **Upload Resume**: Upload your resume in PDF or DOCX format
2. **Add Job Description**: Paste the job description text or upload a TXT file
3. **Analyze**: Click "Analyze ATS Score" to compare your resume against the job
4. **Review Results**: See your ATS score, matching/missing keywords, and suggestions

## API Endpoints

### Health & Info
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |
| GET | `/api` | API documentation |

### Resume Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/resume/upload` | Upload and parse a resume (PDF/DOCX) |
| POST | `/resume/check-ats` | Check ATS keywords against resume text |
| POST | `/resume/optimize` | Get optimization suggestions (JSON) |

### Job Description Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/jd/upload` | Upload and parse a job description (TXT) |
| POST | `/jd/create` | Parse job description from raw text |
| POST | `/jd/extract-keywords` | Extract keywords from text |

## Usage Examples

### Parse a Job Description

```bash
curl -X POST http://localhost:5000/jd/create \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Senior Software Engineer at TechCorp...[full job description]"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "roleTitle": "Senior Software Engineer",
    "company": "TechCorp",
    "responsibilities": ["Design scalable systems", "..."],
    "requiredSkills": [{"name": "TypeScript", "level": "intermediate"}],
    "atsKeywords": ["TypeScript", "React", "Node.js", "AWS"],
    "experienceRequired": "5+ years"
  }
}
```

### Check ATS Score

```bash
curl -X POST http://localhost:5000/resume/check-ats \
  -H "Content-Type: application/json" \
  -d '{
    "resumeText": "Senior Frontend Engineer with 5+ years experience in React...",
    "jobDescription": {
      "roleTitle": "Full Stack Developer",
      "atsKeywords": ["React", "Node.js", "PostgreSQL"],
      ...
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "atsScore": 75,
    "matchingKeywords": ["React"],
    "missingKeywords": ["Node.js", "PostgreSQL"],
    "suggestions": [
      "Consider updating your job title from \"Senior Frontend Engineer\" to \"Full Stack Developer\"",
      "Add missing keywords: Node.js, PostgreSQL"
    ]
  }
}
```

## Project Structure

```
JobTailor/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Express app entry point
│   │   ├── types.ts              # TypeScript interfaces
│   │   ├── controllers/
│   │   │   ├── resumeController.ts
│   │   │   └── jdController.ts
│   │   ├── services/
│   │   │   ├── resumeParser.ts   # PDF/DOCX text extraction
│   │   │   ├── resumeOptimizer.ts # ATS scoring
│   │   │   └── jdParser.ts       # Job description parsing
│   │   ├── routes/
│   │   │   ├── resumeRoutes.ts
│   │   │   └── jdRoutes.ts
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts   # Global error handling
│   │   │   └── validation.ts     # Zod schemas
│   │   └── utils/
│   │       ├── fileUpload.ts     # Multer config
│   │       └── atsKeywords.ts    # Keyword dictionary
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/           # React components
│   │   ├── pages/                # Home and Results pages
│   │   ├── services/             # API calls
│   │   └── types/                # TypeScript interfaces
│   └── package.json
└── package.json                   # Monorepo root
```

## Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000

# File Upload
MAX_FILE_SIZE=5242880
```

## Roadmap

- [ ] Database persistence (PostgreSQL)
- [ ] User authentication
- [ ] Resume templates
- [ ] PDF generation support
- [ ] Batch processing for multiple job applications
- [ ] Browser extension for job sites

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.
