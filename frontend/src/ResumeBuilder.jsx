import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import html2pdf from "html2pdf.js";
import "./resumebuilder.css";

function ResumeBuilder() {
  const [form, setForm] = useState({
    name: "Jane Doe",
    title: "Full Stack Developer",
    phone: "+8801234567890",
    email: "jane.doe@example.com",
    location: "Dhaka, Bangladesh",
    objective:
      "Motivated developer with 4+ years of experience in building scalable web applications and clean user interfaces with a focus on user experience and maintainability.",
    skills:
      "* JavaScript, TypeScript, Python\n* React, Vue, Next.js\n* Node.js, Express, Flask\n* MongoDB, MySQL, Firebase\n* UI/UX: Figma, Adobe XD"
  });

  const [education, setEducation] = useState([
    {
      institution: "University of XYZ",
      title: "B.Sc. in Computer Science, CGPA: 3.85, 2022"
    }
  ]);

  const [experience, setExperience] = useState([
    {
      role: "Full Stack Developer, TechSoft BD (2022 - Present)",
      description:
        "Developed scalable web applications and REST APIs using Node.js and React, collaborating in agile teams."
    }
  ]);

  const [projects, setProjects] = useState([
    {
      name: "Task Manager App",
      description:
        "Built a task management system with React and Firebase, supporting real-time collaboration and notifications."
    }
  ]);

  const [photo, setPhoto] = useState(
    "https://via.placeholder.com/90x110"
  );

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  }

  function handlePhoto(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      setPhoto(e.target.result);
    };

    reader.readAsDataURL(file);
  }

  function addEducation() {
    setEducation((previous) => [
      ...previous,
      {
        institution: "",
        title: ""
      }
    ]);
  }

  function addExperience() {
    setExperience((previous) => [
      ...previous,
      {
        role: "",
        description: ""
      }
    ]);
  }

  function addProject() {
    setProjects((previous) => [
      ...previous,
      {
        name: "",
        description: ""
      }
    ]);
  }

  function updateEducation(index, field, value) {
    setEducation((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value
            }
          : item
      )
    );
  }

  function updateExperience(index, field, value) {
    setExperience((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value
            }
          : item
      )
    );
  }

  function updateProject(index, field, value) {
    setProjects((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value
            }
          : item
      )
    );
  }

  function downloadPDF() {
    const element = document.getElementById("resume");

    const options = {
      margin: 0.3,
      filename: "Resume.pdf",
      image: {
        type: "jpeg",
        quality: 0.98
      },
      html2canvas: {
        scale: 2
      },
      jsPDF: {
        unit: "in",
        format: "letter",
        orientation: "portrait"
      }
    };

    html2pdf()
      .set(options)
      .from(element)
      .save();
  }

  const skillsList = form.skills
    .split("\n")
    .filter((skill) => skill.trim() !== "")
    .map((skill) =>
      skill.replace(/^\*\s*/, "")
    );

  return (
    <div className="builder-page">

      <div className="builder-container">

        <div className="editor">

          <h2>Edit Resume</h2>

          <label>
            Upload Profile Photo:
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={handlePhoto}
          />

          <label>Name:</label>

          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
          />

          <label>Title:</label>

          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
          />

          <label>Phone:</label>

          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />

          <label>Email:</label>

          <input
            type="text"
            name="email"
            value={form.email}
            onChange={handleChange}
          />

          <label>Location:</label>

          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
          />

          <label>Career Objective:</label>

          <textarea
            name="objective"
            value={form.objective}
            onChange={handleChange}
          />

          <label>Education:</label>

          {education.map((item, index) => (
            <div
              className="education-entry"
              key={index}
            >
              <input
                type="text"
                placeholder="Institution name"
                value={item.institution}
                onChange={(e) =>
                  updateEducation(
                    index,
                    "institution",
                    e.target.value
                  )
                }
              />

              <input
                type="text"
                placeholder="Degree, CGPA, Year"
                value={item.title}
                onChange={(e) =>
                  updateEducation(
                    index,
                    "title",
                    e.target.value
                  )
                }
              />
            </div>
          ))}

          <button
            type="button"
            className="btn-add-education"
            onClick={addEducation}
          >
            + Add Education
          </button>

          <label>Skills (use * for list):</label>

          <textarea
            name="skills"
            rows="6"
            value={form.skills}
            onChange={handleChange}
          />

          <label>Experience:</label>

          {experience.map((item, index) => (
            <div
              className="experience-entry"
              key={index}
            >
              <input
                type="text"
                placeholder="Job Title / Role"
                value={item.role}
                onChange={(e) =>
                  updateExperience(
                    index,
                    "role",
                    e.target.value
                  )
                }
              />

              <textarea
                placeholder="Description / Details"
                value={item.description}
                onChange={(e) =>
                  updateExperience(
                    index,
                    "description",
                    e.target.value
                  )
                }
              />
            </div>
          ))}

          <button
            type="button"
            className="btn-add-experience"
            onClick={addExperience}
          >
            + Add Experience
          </button>

          <label>Projects:</label>

          {projects.map((item, index) => (
            <div
              className="project-entry"
              key={index}
            >
              <input
                type="text"
                placeholder="Project Name"
                value={item.name}
                onChange={(e) =>
                  updateProject(
                    index,
                    "name",
                    e.target.value
                  )
                }
              />

              <textarea
                placeholder="Project Description"
                value={item.description}
                onChange={(e) =>
                  updateProject(
                    index,
                    "description",
                    e.target.value
                  )
                }
              />
            </div>
          ))}

          <button
            type="button"
            className="btn-add-project"
            onClick={addProject}
          >
            + Add Project
          </button>

          <div className="builder-actions">

            <button
              type="button"
              className="update"
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: "smooth"
                })
              }
            >
              Update Preview
            </button>

            <button
              type="button"
              className="download"
              onClick={downloadPDF}
            >
              Download PDF
            </button>

          </div>

          <Link
            to="/dashboard"
            className="builder-back-link"
          >
            ? Back to Dashboard
          </Link>

        </div>

        <div className="preview">

          <div
            className="resume-box"
            id="resume"
          >

            <div className="header">

              <div className="info">

                <h1>{form.name}</h1>

                <p>
                  <span>{form.title}</span>
                </p>

                <p>
                  <span>Phone:</span>{" "}
                  <span>{form.phone}</span>
                </p>

                <p>
                  <span>Email:</span>{" "}
                  <span>{form.email}</span>
                </p>

                <p>
                  <span>Location:</span>{" "}
                  <span>{form.location}</span>
                </p>

              </div>

              <img
                src={photo}
                alt="Profile"
              />

            </div>

            <div className="section">

              <h2>Career Objective</h2>

              <p id="p_objective">
                {form.objective}
              </p>

            </div>

            <div className="section">

              <h2>Education</h2>

              <div>
                {education.map((item, index) => (
                  <div key={index}>
                    {item.institution && (
                      <p className="education-institution">
                        {item.institution}
                      </p>
                    )}

                    {item.title && (
                      <p className="education-title">
                        {item.title}
                      </p>
                    )}
                  </div>
                ))}
              </div>

            </div>

            <div className="section">

              <h2>Skills</h2>

              <ul id="p_skills">
                {skillsList.map((skill, index) => (
                  <li key={index}>
                    {skill}
                  </li>
                ))}
              </ul>

            </div>

            <div className="section">

              <h2>Experience</h2>

              <div>
                {experience.map((item, index) => (
                  <div key={index}>

                    {item.role && (
                      <p className="experience-role">
                        {item.role}
                      </p>
                    )}

                    {item.description && (
                      <p className="experience-description">
                        {item.description}
                      </p>
                    )}

                  </div>
                ))}
              </div>

            </div>

            <div className="section">

              <h2>Projects</h2>

              <div>
                {projects.map((item, index) => (
                  <div key={index}>

                    {item.name && (
                      <p className="project-name">
                        {item.name}
                      </p>
                    )}

                    {item.description && (
                      <p className="project-description">
                        {item.description}
                      </p>
                    )}

                  </div>
                ))}
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ResumeBuilder;
