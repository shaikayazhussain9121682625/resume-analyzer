from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from flask_sqlalchemy import SQLAlchemy

import os
import re
import docx2txt
import PyPDF2
import docx

from pdfminer.high_level import extract_text
from datetime import timedelta

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# ============================================================
# APP CONFIGURATION
# ============================================================

app = Flask(__name__)

app.secret_key = "resume-analyzer-secret-key"

# React frontend URLs allowed to communicate with Flask
CORS(
    app,
    supports_credentials=True,
    origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://resume-analyzer-azure-seven.vercel.app"
    ]
)

# SQLite database
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
INSTANCE_DIR = os.path.join(BASE_DIR, "instance")

os.makedirs(INSTANCE_DIR, exist_ok=True)

app.config["SQLALCHEMY_DATABASE_URI"] = (
    "sqlite:///" + os.path.join(INSTANCE_DIR, "analyzer.db")
)

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Resume upload folder
app.config["UPLOAD_FOLDER"] = os.path.join(BASE_DIR, "uploads")

os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

# Session
app.permanent_session_lifetime = timedelta(days=7)
app.config["SESSION_COOKIE_SAMESITE"] = "None"
app.config["SESSION_COOKIE_SECURE"] = True
app.config["SESSION_COOKIE_HTTPONLY"] = True

db = SQLAlchemy(app)


# ============================================================
# ALLOWED FILE TYPES
# ============================================================

ALLOWED_EXTENSIONS = {"pdf", "docx"}


def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


# ============================================================
# DATABASE MODEL
# ============================================================

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)

    username = db.Column(
        db.String(20),
        unique=True,
        nullable=False
    )

    email = db.Column(
        db.String(30),
        unique=True,
        nullable=False
    )

    phone = db.Column(
        db.String(11),
        nullable=False
    )

    password = db.Column(
        db.String(128),
        nullable=False
    )

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "phone": self.phone
        }


# ============================================================
# RESUME PARSING
# ============================================================

def parse_pdf(filepath):
    """
    Extract text from a PDF.
    First tries pdfminer.
    If that fails, uses PyPDF2.
    """

    try:
        text = extract_text(filepath)

        if text and text.strip():
            return text

    except Exception as e:
        print("pdfminer error:", e)

    # PyPDF2 fallback
    try:
        text = ""

        with open(filepath, "rb") as file:
            reader = PyPDF2.PdfReader(file)

            for page in reader.pages:
                page_text = page.extract_text()

                if page_text:
                    text += page_text + "\n"

        return text

    except Exception as e:
        print("PyPDF2 error:", e)
        return ""


def parse_docx(filepath):
    """
    Extract text from DOCX.
    """

    try:
        document = docx.Document(filepath)

        paragraphs = [
            paragraph.text
            for paragraph in document.paragraphs
            if paragraph.text.strip()
        ]

        text = "\n".join(paragraphs)

        # Also try docx2txt if normal extraction gives little text
        if len(text.strip()) < 20:
            try:
                text = docx2txt.process(filepath)
            except Exception:
                pass

        return text

    except Exception as e:
        print("DOCX error:", e)

        try:
            return docx2txt.process(filepath)
        except Exception:
            return ""


def parse_resume(filepath):
    """
    Parse PDF or DOCX resume.
    """

    extension = filepath.rsplit(".", 1)[1].lower()

    if extension == "pdf":
        return parse_pdf(filepath)

    if extension == "docx":
        return parse_docx(filepath)

    return ""


# ============================================================
# RESUME SCORING
# ============================================================

def score_resume_detailed(text):
    """
    Calculate resume score using the original project's
    category-based scoring logic.
    """

    text_lower = text.lower()

    results = []
    total_score = 0

    # --------------------------------------------------------
    # Contact Information
    # --------------------------------------------------------

    contact_score = 0
    contact_flaws = []
    contact_fix_tips = []
    contact_suggestions = []

    email_found = re.search(
        r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b",
        text
    )

    phone_found = re.search(
        r"\b(?:\+91[-\s]?)?[6-9]\d{9}\b",
        text
    )

    if email_found:
        contact_score += 5
    else:
        contact_flaws.append("Email address is missing.")
        contact_fix_tips.append("Add a professional email address.")

    if phone_found:
        contact_score += 5
    else:
        contact_flaws.append("Phone number is missing.")
        contact_fix_tips.append("Add a valid contact number.")

    if contact_score == 10:
        contact_suggestions.append(
            "Your contact information is complete."
        )

    results.append({
        "category": "Contact Information",
        "score": contact_score,
        "max_score": 10,
        "flaws": contact_flaws,
        "fix_tips": contact_fix_tips,
        "suggestions": contact_suggestions
    })

    total_score += contact_score

    # --------------------------------------------------------
    # Summary / Objective
    # --------------------------------------------------------

    summary_score = 0
    summary_flaws = []
    summary_fix_tips = []
    summary_suggestions = []

    summary_keywords = [
        "summary",
        "objective",
        "career objective",
        "profile",
        "professional summary"
    ]

    if any(keyword in text_lower for keyword in summary_keywords):
        summary_score = 10
        summary_suggestions.append(
            "Your resume contains a summary or objective section."
        )
    else:
        summary_flaws.append(
            "Professional summary or career objective is missing."
        )
        summary_fix_tips.append(
            "Add a short professional summary focused on your skills and goals."
        )

    results.append({
        "category": "Summary",
        "score": summary_score,
        "max_score": 10,
        "flaws": summary_flaws,
        "fix_tips": summary_fix_tips,
        "suggestions": summary_suggestions
    })

    total_score += summary_score

    # --------------------------------------------------------
    # Skills
    # --------------------------------------------------------

    skills_score = 0
    skills_flaws = []
    skills_fix_tips = []
    skills_suggestions = []

    skills = [
        "python",
        "java",
        "sql",
        "excel",
        "communication",
        "teamwork",
        "leadership"
    ]

    found_skills = []

    for skill in skills:
        if skill in text_lower:
            found_skills.append(skill)

    skills_score = min(len(found_skills) * 3, 15)

    if skills_score < 15:
        skills_flaws.append(
            "Some important job-related skills may be missing."
        )

        skills_fix_tips.append(
            "Add relevant technical and soft skills from the job description."
        )

        skills_suggestions.append(
            "Customize your skills section for each job."
        )
    else:
        skills_suggestions.append(
            "Your resume contains a good range of listed skills."
        )

    results.append({
        "category": "Skills",
        "score": skills_score,
        "max_score": 15,
        "flaws": skills_flaws,
        "fix_tips": skills_fix_tips,
        "suggestions": skills_suggestions
    })

    total_score += skills_score

    # --------------------------------------------------------
    # Work Experience
    # --------------------------------------------------------

    experience_score = 0
    experience_flaws = []
    experience_fix_tips = []
    experience_suggestions = []

    experience_keywords = [
        "experience",
        "worked",
        "managed",
        "developed",
        "achieved"
    ]

    if any(keyword in text_lower for keyword in experience_keywords):
        experience_score = 20

        experience_suggestions.append(
            "Your resume includes work or project experience."
        )
    else:
        experience_flaws.append(
            "Work experience section may be missing."
        )

        experience_fix_tips.append(
            "Add internships, projects, freelance work, or professional experience."
        )

    results.append({
        "category": "Experience",
        "score": experience_score,
        "max_score": 20,
        "flaws": experience_flaws,
        "fix_tips": experience_fix_tips,
        "suggestions": experience_suggestions
    })

    total_score += experience_score

    # --------------------------------------------------------
    # Education
    # --------------------------------------------------------

    education_score = 0
    education_flaws = []
    education_fix_tips = []
    education_suggestions = []

    education_keywords = [
        "bachelor",
        "master",
        "university",
        "college",
        "degree"
    ]

    if any(keyword in text_lower for keyword in education_keywords):
        education_score = 15

        education_suggestions.append(
            "Your educational background is included."
        )
    else:
        education_flaws.append(
            "Education information may be missing."
        )

        education_fix_tips.append(
            "Add your degree, college/university and graduation details."
        )

    results.append({
        "category": "Education",
        "score": education_score,
        "max_score": 15,
        "flaws": education_flaws,
        "fix_tips": education_fix_tips,
        "suggestions": education_suggestions
    })

    total_score += education_score

    # --------------------------------------------------------
    # Certifications
    # --------------------------------------------------------

    certification_score = 0
    certification_flaws = []
    certification_fix_tips = []
    certification_suggestions = []

    certification_keywords = [
        "certification",
        "certified"
    ]

    if any(keyword in text_lower for keyword in certification_keywords):
        certification_score = 10

        certification_suggestions.append(
            "Your resume contains certification information."
        )
    else:
        certification_flaws.append(
            "Certifications are not mentioned."
        )

        certification_fix_tips.append(
            "Add relevant certifications if you have them."
        )

    results.append({
        "category": "Certifications",
        "score": certification_score,
        "max_score": 10,
        "flaws": certification_flaws,
        "fix_tips": certification_fix_tips,
        "suggestions": certification_suggestions
    })

    total_score += certification_score

    # --------------------------------------------------------
    # Formatting and Length
    # --------------------------------------------------------

    formatting_score = 0
    formatting_flaws = []
    formatting_fix_tips = []
    formatting_suggestions = []

    if len(text.strip()) > 500:
        formatting_score = 10

        formatting_suggestions.append(
            "Resume contains sufficient textual content."
        )
    else:
        formatting_flaws.append(
            "Resume contains very little text."
        )

        formatting_fix_tips.append(
            "Add relevant education, skills, projects and experience details."
        )

    results.append({
        "category": "Formatting & Length",
        "score": formatting_score,
        "max_score": 10,
        "flaws": formatting_flaws,
        "fix_tips": formatting_fix_tips,
        "suggestions": formatting_suggestions
    })

    total_score += formatting_score

    # --------------------------------------------------------
    # Keyword Match
    # --------------------------------------------------------

    keyword_score = 0
    keyword_flaws = []
    keyword_fix_tips = []
    keyword_suggestions = []

    important_keywords = [
        "python",
        "data",
        "analysis",
        "machine learning",
        "project"
    ]

    found_keywords = []

    for keyword in important_keywords:
        if keyword in text_lower:
            found_keywords.append(keyword)

    keyword_score = min(len(found_keywords) * 2, 10)

    if keyword_score < 10:
        keyword_flaws.append(
            "Some commonly used job-related keywords may be missing."
        )

        keyword_fix_tips.append(
            "Compare your resume with the job description and add relevant keywords naturally."
        )
    else:
        keyword_suggestions.append(
            "Your resume contains several relevant keywords."
        )

    results.append({
        "category": "Keyword Match",
        "score": keyword_score,
        "max_score": 10,
        "flaws": keyword_flaws,
        "fix_tips": keyword_fix_tips,
        "suggestions": keyword_suggestions
    })

    total_score += keyword_score

    # Maximum score = 100
    total_score = min(total_score, 100)

    return total_score, results


# ============================================================
# REACT API
# ============================================================

@app.route("/api/health", methods=["GET"])
def api_health():
    return jsonify({
        "success": True,
        "message": "Flask API is running"
    })


# ============================================================
# SIGNUP API
# ============================================================

@app.route("/api/signup", methods=["POST"])
def api_signup():

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data received."
            }), 400

        username = data.get("username", "").strip()
        email = data.get("email", "").strip()
        phone = data.get("phone", "").strip()
        password = data.get("password", "")
        confirm_password = data.get("confirm_password", "")

        # Validation
        if not username or not email or not phone or not password:
            return jsonify({
                "success": False,
                "message": "All fields are required."
            }), 400

        if password != confirm_password:
            return jsonify({
                "success": False,
                "message": "Passwords do not match."
            }), 400

        if len(username) > 20:
            return jsonify({
                "success": False,
                "message": "Username must be 20 characters or less."
            }), 400

        if len(email) > 30:
            return jsonify({
                "success": False,
                "message": "Email must be 30 characters or less."
            }), 400

        if User.query.filter_by(username=username).first():
            return jsonify({
                "success": False,
                "message": "Username already exists."
            }), 409

        if User.query.filter_by(email=email).first():
            return jsonify({
                "success": False,
                "message": "Email already exists."
            }), 409

        hashed_password = generate_password_hash(password)

        user = User(
            username=username,
            email=email,
            phone=phone,
            password=hashed_password
        )

        db.session.add(user)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Account created successfully.",
            "user": user.to_dict()
        }), 201

    except Exception as e:

        db.session.rollback()

        print("Signup error:", e)

        return jsonify({
            "success": False,
            "message": "Unable to create account."
        }), 500


# ============================================================
# LOGIN API
# ============================================================

@app.route("/api/login", methods=["POST"])
def api_login():

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data received."
            }), 400

        username = data.get("username", "").strip()
        password = data.get("password", "")

        if not username or not password:
            return jsonify({
                "success": False,
                "message": "Username and password are required."
            }), 400

        user = User.query.filter_by(username=username).first()

        if not user:
            return jsonify({
                "success": False,
                "message": "Invalid username or password."
            }), 401

        if not check_password_hash(user.password, password):
            return jsonify({
                "success": False,
                "message": "Invalid username or password."
            }), 401

        session.permanent = True
        session["user_id"] = user.id
        session["username"] = user.username

        return jsonify({
            "success": True,
            "message": "Login successful.",
            "user": user.to_dict()
        })

    except Exception as e:

        print("Login error:", e)

        return jsonify({
            "success": False,
            "message": "Unable to login."
        }), 500


# ============================================================
# CURRENT USER API
# ============================================================

@app.route("/api/me", methods=["GET"])
def api_me():

    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Not logged in."
        }), 401

    user = db.session.get(User, user_id)

    if not user:
        session.clear()

        return jsonify({
            "success": False,
            "message": "User not found."
        }), 401

    return jsonify({
        "success": True,
        "user": user.to_dict()
    })


# ============================================================
# LOGOUT API
# ============================================================

@app.route("/api/logout", methods=["POST"])
def api_logout():

    session.clear()

    return jsonify({
        "success": True,
        "message": "Logged out successfully."
    })


# ============================================================
# RESUME UPLOAD API
# ============================================================

# ============================================================
# RESUME INFORMATION EXTRACTION
# ============================================================

def extract_resume_info(text):

    import re

    text = text.replace("\xa0", " ")
    text = re.sub(r'[ \t]+', ' ', text)

    lines = [
        line.strip()
        for line in text.splitlines()
        if line.strip()
    ]

    # Email
    email_match = re.search(
        r'[\w\.-]+@[\w\.-]+\.\w+',
        text
    )

    email = email_match.group(0) if email_match else ""

    # Phone
    phone_match = re.search(
        r'(?:\+91[\s-]?)?[6-9]\d{9}',
        text
    )

    phone = phone_match.group(0) if phone_match else ""

    # Name
    name = ""

    for line in lines[:15]:

        clean = line.strip()

        if "@" in clean:
            continue

        if re.search(r'\d', clean):
            continue

        if len(clean.split()) < 2:
            continue

        if len(clean.split()) > 5:
            continue

        if clean.lower() in [
            "resume",
            "curriculum vitae",
            "cv",
            "profile",
            "objective",
            "summary",
            "contact"
        ]:
            continue

        if all(
            re.match(r'^[A-Za-z.\'-]+$', word)
            for word in clean.split()
        ):
            name = clean
            break

    # Section extraction
    def extract_section(section_names):

        start = -1

        for i, line in enumerate(lines):

            normalized = re.sub(
                r'[^a-z& ]',
                '',
                line.lower()
            ).strip()

            if normalized in section_names:
                start = i
                break

        if start == -1:
            return []

        headers = [
            "skills",
            "technical skills",
            "technical skill",
            "key skills",
            "skills technologies",
            "skills & technologies",
            "technologies",
            "core competencies",
            "core competency",

            "education",
            "educational qualification",
            "academic qualification",
            "academic background",

            "experience",
            "work experience",
            "professional experience",
            "work history",
            "employment history",
            "internship",
            "internships",

            "projects",
            "project",
            "academic projects",
            "personal projects",
            "major projects",
            "project experience",

            "certifications",
            "certification",
            "certificates",
            "courses & certifications",

            "achievements",
            "achievement",

            "summary",
            "professional summary",
            "career summary",
            "objective",
            "profile",

            "contact",
            "contact details",
            "personal details",

            "languages",
            "declaration",
            "references"
        ]

        result = []

        for line in lines[start + 1:]:

            normalized = re.sub(
                r'[^a-z& ]',
                '',
                line.lower()
            ).strip()

            if normalized in headers:
                break

            result.append(line)

        return result

    skills = extract_section([
        "skills",
        "technical skills",
        "technical skill",
        "key skills",
        "skills technologies",
        "skills & technologies",
        "technologies",
        "core competencies",
        "core competency"
    ])

    education = extract_section([
        "education",
        "educational qualification",
        "academic qualification",
        "academic background"
    ])

    experience = extract_section([
        "experience",
        "work experience",
        "professional experience",
        "work history",
        "employment history",
        "internship",
        "internships"
    ])

    projects = extract_section([
        "projects",
        "project",
        "academic projects",
        "personal projects",
        "major projects",
        "project experience"
    ])

    certifications = extract_section([
        "certifications",
        "certification",
        "certificates",
        "courses & certifications"
    ])

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "skills": skills,
        "education": education,
        "experience": experience,
        "projects": projects,
        "certifications": certifications
    }


@app.route("/api/upload_resume", methods=["POST"])
def api_upload_resume():

    try:

        if "user_id" not in session:
            return jsonify({
                "success": False,
                "message": "Please login first."
            }), 401

        if "resume" not in request.files:
            return jsonify({
                "success": False,
                "message": "Please select a resume."
            }), 400

        file = request.files["resume"]

        if not file or file.filename == "":
            return jsonify({
                "success": False,
                "message": "Please select a resume."
            }), 400

        if not allowed_file(file.filename):
            return jsonify({
                "success": False,
                "message": "Only PDF and DOCX files are allowed."
            }), 400

        filename = secure_filename(file.filename)

        final_filename = (
            str(session["user_id"])
            + "_"
            + filename
        )

        filepath = os.path.join(
            app.config["UPLOAD_FOLDER"],
            final_filename
        )

        file.save(filepath)

        # Extract resume text
        text = parse_resume(filepath)

        if not text.strip():
            return jsonify({
                "success": False,
                "message": "Could not extract text from the resume."
            }), 400

        # Existing scoring - DO NOT CHANGE
        score, results = score_resume_detailed(text)

        # Extract resume information
        extracted = extract_resume_info(text)

        return jsonify({
            "success": True,
            "message": "Resume analyzed successfully.",
            "score": score,
            "results": results,
            "filename": filename,
            "extracted": extracted
        })

    except Exception as e:

        print("Resume upload error:", e)

        return jsonify({
            "success": False,
            "message": "Unable to analyze resume."
        }), 500


# RESUME MATCHER API
# ============================================================

@app.route("/api/matcher", methods=["POST"])
def api_matcher():

    try:

        if "user_id" not in session:
            return jsonify({
                "success": False,
                "message": "Please login first."
            }), 401

        job_description = request.files.get("job_description")
        resumes = request.files.getlist("resumes")

        # Job description can also be sent as normal form text
        job_text = request.form.get("job_description_text", "").strip()

        if job_description and job_description.filename:
            try:
                temp_filename = secure_filename(
                    job_description.filename
                )

                temp_path = os.path.join(
                    app.config["UPLOAD_FOLDER"],
                    "job_" + temp_filename
                )

                job_description.save(temp_path)

                job_text = parse_resume(temp_path)

            except Exception as e:
                print("Job description file error:", e)

        if not job_text:
            return jsonify({
                "success": False,
                "message": "Please provide a job description."
            }), 400

        valid_resumes = []

        for file in resumes:

            if not file or not file.filename:
                continue

            filename = secure_filename(file.filename)

            extension = (
                filename.rsplit(".", 1)[1].lower()
                if "." in filename
                else ""
            )

            if extension not in {"pdf", "docx", "txt"}:
                continue

            filepath = os.path.join(
                app.config["UPLOAD_FOLDER"],
                "match_" + filename
            )

            file.save(filepath)

            if extension == "txt":
                try:
                    with open(
                        filepath,
                        "r",
                        encoding="utf-8",
                        errors="ignore"
                    ) as f:
                        resume_text = f.read()
                except Exception:
                    resume_text = ""
            else:
                resume_text = parse_resume(filepath)

            if resume_text.strip():
                valid_resumes.append({
                    "filename": filename,
                    "text": resume_text
                })

        if len(valid_resumes) < 1:
            return jsonify({
                "success": False,
                "message": "Please upload at least one valid resume."
            }), 400

        # TF-IDF
        documents = [job_text]

        for resume in valid_resumes:
            documents.append(resume["text"])

        vectorizer = TfidfVectorizer(
            stop_words="english"
        )

        vectors = vectorizer.fit_transform(documents)

        job_vector = vectors[0]
        resume_vectors = vectors[1:]

        similarities = cosine_similarity(
            job_vector,
            resume_vectors
        )[0]

        ranked = []

        for index, score in enumerate(similarities):

            ranked.append({
                "filename": valid_resumes[index]["filename"],
                "score": round(float(score), 4)
            })

        ranked.sort(
            key=lambda item: item["score"],
            reverse=True
        )

        top_resumes = [
            item["filename"]
            for item in ranked[:5]
        ]

        similarity_scores = [
            item["score"]
            for item in ranked[:5]
        ]

        return jsonify({
            "success": True,
            "message": "Resume matching completed successfully.",
            "top_resumes": top_resumes,
            "similarity_scores": similarity_scores,
            "results": ranked
        })

    except Exception as e:

        print("Matcher error:", e)

        return jsonify({
            "success": False,
            "message": "Unable to match resumes."
        }), 500


# ============================================================
# ORIGINAL FLASK TEMPLATE ROUTES
# These are kept for backward compatibility.
# ============================================================

@app.route("/")
def home():
    return render_template("home.html")


@app.route("/home")
def home_page():
    return render_template("home.html")


@app.route("/product")
def product():
    return render_template("product.html")


@app.route("/profile")
def profile():

    if "user_id" not in session:
        return redirect(url_for("login"))

    user = db.session.get(
        User,
        session["user_id"]
    )

    return render_template(
        "profile.html",
        user=user
    )


# ============================================================
# ORIGINAL SIGNUP ROUTE
# ============================================================

@app.route("/signup", methods=["GET", "POST"])
def signup():

    if request.method == "POST":

        username = request.form.get(
            "username",
            ""
        ).strip()

        email = request.form.get(
            "email",
            ""
        ).strip()

        phone = request.form.get(
            "phone",
            ""
        ).strip()

        password = request.form.get(
            "password",
            ""
        )

        confirm_password = request.form.get(
            "confirm_password",
            ""
        )

        if not username or not email or not phone or not password:
            flash("All fields are required.", "error")
            return redirect(url_for("signup"))

        if password != confirm_password:
            flash("Passwords do not match.", "error")
            return redirect(url_for("signup"))

        if User.query.filter_by(username=username).first():
            flash("Username already exists.", "error")
            return redirect(url_for("signup"))

        if User.query.filter_by(email=email).first():
            flash("Email already exists.", "error")
            return redirect(url_for("signup"))

        hashed_password = generate_password_hash(password)

        user = User(
            username=username,
            email=email,
            phone=phone,
            password=hashed_password
        )

        db.session.add(user)
        db.session.commit()

        flash(
            "Account created successfully. Please login.",
            "success"
        )

        return redirect(url_for("login"))

    return render_template("signup.html")


# ============================================================
# ORIGINAL LOGIN ROUTE
# ============================================================

@app.route("/login", methods=["GET", "POST"])
def login():

    if request.method == "POST":

        username = request.form.get(
            "username",
            ""
        ).strip()

        password = request.form.get(
            "password",
            ""
        )

        user = User.query.filter_by(
            username=username
        ).first()

        if user and check_password_hash(
            user.password,
            password
        ):

            session.permanent = True

            session["user_id"] = user.id
            session["username"] = user.username

            return redirect(
                url_for("dashboard")
            )

        flash(
            "Invalid username or password.",
            "error"
        )

    return render_template("login.html")


# ============================================================
# DASHBOARD
# ============================================================

@app.route("/dashboard")
def dashboard():

    if "user_id" not in session:
        return redirect(url_for("login"))

    username = session.get(
        "username",
        "User"
    )

    return render_template(
        "dashboard.html",
        username=username
    )


# ============================================================
# MATCH RESUME PAGE
# ============================================================

@app.route("/matchresume")
def matchresume():

    if "user_id" not in session:
        return redirect(url_for("login"))

    return render_template(
        "matchresume.html"
    )


# ============================================================
# ORIGINAL MATCHER ROUTE
# ============================================================

@app.route("/matcher", methods=["POST"])
def matcher():

    if "user_id" not in session:
        return redirect(url_for("login"))

    job_description = request.form.get(
        "job_description",
        ""
    ).strip()

    resumes = request.files.getlist(
        "resumes"
    )

    if not job_description:
        flash(
            "Please provide a job description.",
            "error"
        )

        return redirect(
            url_for("matchresume")
        )

    resume_texts = []
    resume_names = []

    for file in resumes:

        if not file or not file.filename:
            continue

        filename = secure_filename(
            file.filename
        )

        if not allowed_file(filename):
            continue

        filepath = os.path.join(
            app.config["UPLOAD_FOLDER"],
            filename
        )

        file.save(filepath)

        text = parse_resume(filepath)

        if text.strip():
            resume_texts.append(text)
            resume_names.append(filename)

    if not resume_texts:
        flash(
            "Please upload valid resumes.",
            "error"
        )

        return redirect(
            url_for("matchresume")
        )

    try:

        documents = [
            job_description
        ] + resume_texts

        vectorizer = TfidfVectorizer(
            stop_words="english"
        )

        vectors = vectorizer.fit_transform(
            documents
        )

        job_vector = vectors[0]
        resume_vectors = vectors[1:]

        similarities = cosine_similarity(
            job_vector,
            resume_vectors
        )[0]

        ranked = sorted(
            zip(
                resume_names,
                similarities
            ),
            key=lambda x: x[1],
            reverse=True
        )

        top_resumes = [
            item[0]
            for item in ranked[:5]
        ]

        similarity_scores = [
            round(float(item[1]), 4)
            for item in ranked[:5]
        ]

        return render_template(
            "matcher_result.html",
            top_resumes=top_resumes,
            similarity_scores=similarity_scores
        )

    except Exception as e:

        print("Original matcher error:", e)

        flash(
            "Error while matching resumes.",
            "error"
        )

        return redirect(
            url_for("matchresume")
        )


# ============================================================
# ORIGINAL UPLOAD RESUME PAGE
# ============================================================

@app.route("/upload_resume", methods=["GET", "POST"])
def upload_resume():

    if "user_id" not in session:
        return redirect(url_for("login"))

    if request.method == "GET":
        return render_template(
            "upload.html"
        )

    if "resume" not in request.files:
        flash(
            "Please select a resume.",
            "error"
        )

        return redirect(
            url_for("upload_resume")
        )

    file = request.files["resume"]

    if not file or file.filename == "":
        flash(
            "Please select a resume.",
            "error"
        )

        return redirect(
            url_for("upload_resume")
        )

    if not allowed_file(file.filename):
        flash(
            "Only PDF and DOCX files are allowed.",
            "error"
        )

        return redirect(
            url_for("upload_resume")
        )

    filename = secure_filename(
        file.filename
    )

    filepath = os.path.join(
        app.config["UPLOAD_FOLDER"],
        filename
    )

    file.save(filepath)

    text = parse_resume(filepath)

    if not text.strip():
        flash(
            "Could not extract text from the resume.",
            "error"
        )

        return redirect(
            url_for("upload_resume")
        )

    score, results = score_resume_detailed(
        text
    )

    return render_template(
        "result.html",
        score=score,
        results=results
    )


# ============================================================
# RESUME BUILDER
# ============================================================

@app.route("/resumebuilder")
def resumebuilder():

    return render_template(
        "resumebuilder.html"
    )


# ============================================================
# LOGOUT
# ============================================================

@app.route("/logout")
def logout():

    session.clear()

    return redirect(
        url_for("login")
    )


# ============================================================
# DATABASE INITIALIZATION
# ============================================================

with app.app_context():
    db.create_all()


# ============================================================
# RUN APPLICATION
# ============================================================

if __name__ == "__main__":

    os.makedirs(
        app.config["UPLOAD_FOLDER"],
        exist_ok=True
    )

    app.run(
        debug=True,
        host="127.0.0.1",
        port=5000
    )



