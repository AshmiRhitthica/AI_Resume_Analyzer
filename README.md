# JobMatch Hero — AI Resume ATS Analyzer

> **No more guessing games, let AI fix your CV.**

JobMatch Hero is an AI-powered resume analysis application that compares a candidate's resume against a given job description and provides an ATS-style compatibility analysis.

The application accepts a resume in PDF format and a job description, processes the resume using NLP and semantic search techniques, and uses Gemini to generate a structured analysis.

---

## Features

* Upload a resume in PDF format
* Paste a job description
* Extract and preprocess resume text
* Split resume content into smaller chunks
* Generate semantic embeddings using Hugging Face
* Store and search resume chunks using FAISS
* Retrieve resume content relevant to the job description
* Generate an ATS score from 0–100
* Identify matching skills
* Identify missing skills
* Provide content improvement suggestions
* Display the analysis through a modern web interface

---

## How It Works

The application follows this pipeline:

```text
Resume PDF
     ↓
PDF Text Extraction
     ↓
Text Normalization
     ↓
Tokenization & Lemmatization
     ↓
Text Chunking
     ↓
Hugging Face Embeddings
     ↓
FAISS Vector Database
     ↓
Similarity Search using Job Description
     ↓
Relevant Resume Content
     ↓
Gemini
     ↓
ATS Analysis
     ↓
Frontend Results
```

---

## Project Structure

```text
AI_Resume_Analyzer/
│
├── backend/
│   └── app.py
│
├── frontend/
│   ├── index.html
│   ├── script.js
│   └── style.css
│
├── analyzer.py
├── README.md
├── requirements.txt
└── .gitignore
```

### `analyzer.py`

Contains the main resume analysis pipeline:

* PDF loading
* Text normalization
* Tokenization and lemmatization
* Text chunking
* Embedding generation
* FAISS vector database creation
* Similarity search
* Gemini-based ATS analysis

### `backend/app.py`

Provides the Flask backend and API endpoint used by the frontend.

The `/analyze` endpoint:

1. Receives the uploaded resume
2. Receives the job description
3. Temporarily stores the uploaded PDF
4. Runs the resume analyzer
5. Returns the generated analysis
6. Removes the temporary PDF

### `frontend/`

Contains the user interface:

* `index.html` — application structure
* `style.css` — visual design and styling
* `script.js` — file upload, API communication, and result display

---

## Technologies Used

### Python

* Python
* Flask
* Flask-CORS

### NLP & Resume Processing

* spaCy
* contractions
* PyPDFLoader

### Semantic Search

* Hugging Face Sentence Transformers
* FAISS
* LangChain

### Generative AI

* Google Gemini
* LangChain Google GenAI integration

### Frontend

* HTML
* CSS
* JavaScript

---

## Resume Analysis Process

### 1. Resume Loading

The uploaded PDF is processed using `PyPDFLoader` to extract its text.

### 2. Text Normalization

The extracted text is:

* Converted to lowercase
* Whitespace-normalized
* Expanded using the `contractions` library
* Cleaned to retain alphanumeric characters and spaces

### 3. Tokenization

spaCy is used to:

* Tokenize the text
* Remove stop words
* Lemmatize the remaining tokens

### 4. Chunking

The processed resume is divided into smaller chunks using `RecursiveCharacterTextSplitter`.

Current configuration:

```text
Chunk size: 200
Chunk overlap: 40
```

### 5. Embeddings & Vector Search

The chunks are converted into embeddings using:

```text
sentence-transformers/all-MiniLM-L6-V2
```

FAISS is then used to perform similarity search against the job description.

The analyzer retrieves the top 3 relevant resume chunks.

### 6. Gemini Analysis

The retrieved resume content and job description are passed to Gemini.

The model is instructed to provide:

* ATS score
* Matching skills
* Missing skills
* Content improvements

The analyzer is also instructed not to invent skills or experience that are not present in the resume.

---

## Running the Project Locally

### 1. Clone the repository

```bash
git clone https://github.com/AshmiRhitthica/AI_Resume_Analyzer.git
cd AI_Resume_Analyzer
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

Activate it on Windows:

```powershell
venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure the Gemini API key

The application reads the Gemini API key from an environment variable.

Set your API key without placing it directly inside the source code.

For PowerShell:

```powershell
$env:GOOGLE_GEMINI_API_KEY="your-api-key"
```

> Never commit your API key to GitHub.

### 5. Start the Flask backend

From the project root:

```bash
python backend/app.py
```

The backend runs locally on:

```text
http://127.0.0.1:5000
```

### 6. Open the application

Open the application in your browser and upload a resume PDF, paste a job description, and run the analysis.

---

## Example Analysis

For a Junior Data Analyst job description, the application can identify skills such as:

```text
Matching Skills
- Python
- SQL
- Pandas
- NumPy
- Power BI
- Exploratory Data Analysis
- Machine Learning
```

It can also identify missing requirements and provide suggestions for improving the resume based on the job description.

---

## Important Note

The ATS score generated by this application is an **AI-based matching score**, not an official score from a real Applicant Tracking System.

The results are intended to help identify potential gaps between a resume and a job description.

---

## Future Improvements

Possible future improvements include:

* More structured ATS scoring
* Better parsing of resume sections
* Improved skill extraction
* More detailed job requirement analysis
* Additional resume formats
* Deployment for public access
* Improved result visualization

---

## Author

**Ashmi Rhitthica**

GitHub:
https://github.com/AshmiRhitthica

---

## Project

**JobMatch Hero — AI Resume ATS Analyzer**

Built with Python, LangChain, FAISS, Hugging Face, Gemini, Flask, HTML, CSS, and JavaScript.
