import { ResumeData, SAMPLE_DATA } from "@/lib/helpers/student/ai/Resumedata";
import React from "react";


const D = SAMPLE_DATA;

/* ═══════════════════════════════════════════════════════════════════
   TEMPLATE 1 – Classic Two-Column (white bg, left sidebar)
   Matches: Template 1 in image – Aarav Reddy with photo, left sidebar
═══════════════════════════════════════════════════════════════════ */
export function Template1({ data = D }: { data?: ResumeData }) {
  return (
    <div
      id="resume-template-1"
      style={{
        fontFamily: "Arial, sans-serif",
        fontSize: "8.5px",
        color: "#222",
        background: "#fff",
        width: "210mm",
        minHeight: "297mm",
        padding: "12mm 10mm",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #222", paddingBottom: "8px", marginBottom: "8px" }}>
        <div>
          <div style={{ fontSize: "18px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px" }}>{data.name}</div>
          <div style={{ fontSize: "9px", color: "#444", marginTop: "2px" }}>{data.title}</div>
        </div>
        <div style={{ width: "55px", height: "55px", borderRadius: "50%", background: "#ccc", overflow: "hidden", flexShrink: 0 }}>
          <img src={data.photo} alt="photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e: any) => { e.target.style.display = "none"; }} />
        </div>
      </div>

      {/* Two columns */}
      <div style={{ display: "grid", gridTemplateColumns: "38% 60%", gap: "12px" }}>
        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <Section title="PROFILE SUMMARY">
            <p style={{ margin: 0, lineHeight: 1.5 }}>{data.summary}</p>
          </Section>

          <Section title="PERSONAL DETAILS">
            <Row label="Email" value={data.email} />
            <Row label="Phone" value={data.phone} />
            <Row label="LinkedIn" value={data.linkedin} />
            <Row label="Location" value={data.location} />
          </Section>

          <Section title="EDUCATION">
            {data.education.map((e, i) => (
              <div key={i} style={{ marginBottom: "5px" }}>
                <div style={{ fontWeight: "bold", fontSize: "7.5px" }}>{e.level}</div>
                <div>{e.school}</div>
                <div>{e.years}</div>
                <div>{e.percentage}</div>
              </div>
            ))}
          </Section>

          <Section title="ACCOMPLISHMENTS">
            <SubSection label="Awards">
              {data.accomplishments.awards.map((a, i) => <Bullet key={i} text={a} />)}
            </SubSection>
            <SubSection label="Clubs & Committees">
              {data.accomplishments.clubs.map((c, i) => <Bullet key={i} text={c} />)}
            </SubSection>
            <SubSection label="Certifications/Certifications">
              {data.accomplishments.certifications.map((c, i) => <Bullet key={i} text={c} />)}
            </SubSection>
            <SubSection label="Competitive Exams">
              {data.accomplishments.competitiveExams.map((c, i) => <Bullet key={i} text={c} />)}
            </SubSection>
          </Section>

          <Section title="SKILLS">
            <SubSection label="Technical Skills">
              {data.skills.technical.map((s, i) => <div key={i} style={{ margin: "1px 0" }}>{s}</div>)}
            </SubSection>
            <SubSection label="Soft Skills">
              {data.skills.soft.map((s, i) => <div key={i} style={{ margin: "1px 0" }}>{s}</div>)}
            </SubSection>
          </Section>

          <Section title="LANGUAGES">
            {data.languages.map((l, i) => <Bullet key={i} text={l} />)}
          </Section>
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <Section title="INTERNSHIP">
            <div style={{ fontWeight: "bold" }}>{data.internship.company}</div>
            <div>{data.internship.role}</div>
            <div style={{ color: "#555" }}>{data.internship.period}</div>
            <div style={{ whiteSpace: "pre-line", marginTop: "3px" }}>{data.internship.description}</div>
            <div style={{ color: "#1155CC", marginTop: "2px", wordBreak: "break-all" }}>{data.internship.github}</div>
          </Section>

          {data.experience.map((exp, i) => (
            <Section key={i} title={i === 0 ? "EXPERIENCE" : ""}>
              <div style={{ fontWeight: "bold" }}>{exp.company}</div>
              <div style={{ fontStyle: "italic" }}>{exp.role}</div>
              <div style={{ color: "#555" }}>{exp.period}</div>
              {exp.points.map((p, j) => <Bullet key={j} text={p} />)}
            </Section>
          ))}

          <Section title="PROJECTS">
            {data.projects.map((proj, i) => (
              <div key={i} style={{ marginBottom: "5px" }}>
                <div style={{ fontWeight: "bold" }}>{proj.name}</div>
                <div style={{ color: "#555", fontStyle: "italic" }}>{proj.tech}</div>
                {proj.points.map((p, j) => <Bullet key={j} text={p} />)}
                <div style={{ color: "#1155CC", wordBreak: "break-all" }}>{proj.github}</div>
              </div>
            ))}
          </Section>

          <Section title="RESEARCH & PAPERS">
            {data.researchPapers.map((r, i) => (
              <div key={i} style={{ marginBottom: "5px" }}>
                <div style={{ fontWeight: "bold", fontStyle: "italic" }}>{r.title}</div>
                {r.points.map((p, j) => <Bullet key={j} text={p} />)}
              </div>
            ))}
          </Section>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TEMPLATE 2 – Modern Header, Full-width sections, bold name center
   Matches: Template 2 – AARAV REDDY centered, contact row, then sections
═══════════════════════════════════════════════════════════════════ */
export function Template2({ data = D }: { data?: ResumeData }) {
  return (
    <div
      id="resume-template-2"
      style={{
        fontFamily: "Georgia, serif",
        fontSize: "8px",
        color: "#111",
        background: "#fff",
        width: "210mm",
        minHeight: "297mm",
        padding: "10mm",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", borderBottom: "1.5px solid #111", paddingBottom: "6px", marginBottom: "8px" }}>
        <div style={{ fontSize: "20px", fontWeight: "bold", letterSpacing: "3px", textTransform: "uppercase" }}>{data.name}</div>
        <div style={{ fontSize: "8.5px", color: "#444", marginTop: "2px" }}>{data.title}</div>
        <div style={{ fontSize: "7.5px", color: "#555", marginTop: "3px", display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
          <span>📍 {data.location}</span>
          <span>📞 {data.phone}</span>
          <span>✉ {data.email}</span>
          <span>🔗 {data.linkedin}</span>
          <span>💻 {data.github}</span>
        </div>
      </div>

      <Section2 title="PROFESSIONAL SUMMARY">
        <p style={{ margin: 0, lineHeight: 1.6 }}>{data.summary}</p>
      </Section2>

      <Section2 title="KEY SKILLS">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px" }}>
          {[...data.skills.technical, ...data.skills.soft].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "4px" }}>
              <span style={{ marginTop: "1px" }}>•</span><span>{s}</span>
            </div>
          ))}
        </div>
      </Section2>

      <Section2 title="EXPERIENCE">
        {data.experience.map((exp, i) => (
          <div key={i} style={{ marginBottom: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: "bold" }}>{exp.company}</span>
              <span style={{ color: "#555", fontStyle: "italic" }}>{exp.period}</span>
            </div>
            <div style={{ fontStyle: "italic", marginBottom: "3px" }}>{exp.role}</div>
            {exp.points.map((p, j) => <Bullet key={j} text={p} />)}
          </div>
        ))}
      </Section2>

      <Section2 title="EDUCATION">
        {data.education.map((e, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <div>
              <div style={{ fontWeight: "bold" }}>{e.school}</div>
              <div style={{ color: "#555" }}>{e.level}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div>{e.years}</div>
              <div>{e.percentage}</div>
            </div>
          </div>
        ))}
      </Section2>

      <Section2 title="PROJECTS">
        {data.projects.map((p, i) => (
          <div key={i} style={{ marginBottom: "5px" }}>
            <div style={{ fontWeight: "bold" }}>{p.name} <span style={{ fontWeight: "normal", fontStyle: "italic", color: "#555" }}>| {p.tech}</span></div>
            {p.points.map((pt, j) => <Bullet key={j} text={pt} />)}
          </div>
        ))}
      </Section2>

      <Section2 title="ADDITIONAL INFORMATION">
        <Row label="Languages" value={data.additionalInfo.languages} />
        <Row label="Certifications" value={data.additionalInfo.certifications} />
      </Section2>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TEMPLATE 3 – Clean Modern, Green accent header, labeled sections
   Matches: Template 3 – AARAV REDDY with B.A Graduate | Web Developer
═══════════════════════════════════════════════════════════════════ */
export function Template3({ data = D }: { data?: ResumeData }) {
  return (
    <div
      id="resume-template-3"
      style={{
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        fontSize: "8px",
        color: "#1a1a1a",
        background: "#fff",
        width: "210mm",
        minHeight: "297mm",
        padding: "0",
        boxSizing: "border-box",
      }}
    >
      {/* Dark header bar */}
      <div style={{ background: "#1a1a2e", color: "#fff", padding: "14px 16px 10px" }}>
        <div style={{ fontSize: "18px", fontWeight: "bold", letterSpacing: "2px" }}>{data.name.toUpperCase()}</div>
        <div style={{ fontSize: "8.5px", color: "#aad4f5", marginTop: "2px" }}>{data.title}</div>
        <div style={{ display: "flex", gap: "14px", marginTop: "6px", fontSize: "7px", color: "#ccc", flexWrap: "wrap" }}>
          <span>📍 {data.location}</span>
          <span>📞 {data.phone}</span>
          <span>✉ {data.email}</span>
          <span>🔗 {data.linkedin}</span>
          <span>💻 {data.github}</span>
        </div>
      </div>

      <div style={{ padding: "10px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
        <Section3 title="SUMMARY">
          <p style={{ margin: 0, lineHeight: 1.6 }}>{data.summary}</p>
        </Section3>

        <Section3 title="TECHNICAL SKILLS">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 16px" }}>
            {data.skills.technical.map((s, i) => <Bullet key={i} text={s} />)}
          </div>
        </Section3>

        <Section3 title="PROFESSIONAL EXPERIENCE">
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: "bold", color: "#1a1a2e" }}>{exp.company}</span>
                <span style={{ color: "#666", fontStyle: "italic", fontSize: "7px" }}>{exp.period}</span>
              </div>
              <div style={{ fontStyle: "italic", marginBottom: "3px", color: "#444" }}>{exp.role}</div>
              {exp.points.map((p, j) => <Bullet key={j} text={p} />)}
            </div>
          ))}
        </Section3>

        <Section3 title="PROJECTS">
          {data.projects.map((p, i) => (
            <div key={i} style={{ marginBottom: "5px" }}>
              <div style={{ fontWeight: "bold" }}>{p.name} <span style={{ color: "#666", fontWeight: "normal" }}>| {p.tech}</span></div>
              {p.points.map((pt, j) => <Bullet key={j} text={pt} />)}
            </div>
          ))}
        </Section3>

        <Section3 title="EDUCATION">
          {data.education.map((e, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
              <div>
                <div style={{ fontWeight: "bold" }}>{e.level}</div>
                <div style={{ color: "#555" }}>{e.school}</div>
                <div style={{ color: "#555" }}>Percentage: {e.percentage}</div>
              </div>
              <div style={{ textAlign: "right", color: "#555" }}>{e.years}</div>
            </div>
          ))}
        </Section3>

        <Section3 title="ADDITIONAL INFORMATION">
          <Row label="Languages" value={data.additionalInfo.languages} />
          <Row label="Certifications" value={data.additionalInfo.certifications} />
        </Section3>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TEMPLATE 4 – Left sidebar dark, right content, labeled boxes
   Matches: Template 4 – AARAV REDDY | B.A Graduate | Web Developer
   with SUMMARY, WORK EXPERIENCE, EDUCATION, KEY SKILLS, PROJECTS
═══════════════════════════════════════════════════════════════════ */
export function Template4({ data = D }: { data?: ResumeData }) {
  return (
    <div
      id="resume-template-4"
      style={{
        fontFamily: "Arial, sans-serif",
        fontSize: "8px",
        color: "#222",
        background: "#fff",
        width: "210mm",
        minHeight: "297mm",
        boxSizing: "border-box",
        display: "grid",
        gridTemplateColumns: "35% 65%",
      }}
    >
      {/* LEFT SIDEBAR */}
      <div style={{ background: "#1a1a2e", color: "#e0e0e0", padding: "14px 10px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <div>
          <div style={{ fontSize: "14px", fontWeight: "bold", color: "#fff", letterSpacing: "1px" }}>{data.name.toUpperCase()}</div>
          <div style={{ fontSize: "7.5px", color: "#aad4f5", marginTop: "2px" }}>{data.title}</div>
        </div>

        <SideSection title="CONTACT">
          <div style={{ color: "#ccc", fontSize: "7px", lineHeight: 1.8 }}>
            <div>📞 {data.phone}</div>
            <div>✉ {data.email}</div>
            <div>📍 {data.location}</div>
            <div style={{ wordBreak: "break-all" }}>🔗 {data.linkedin}</div>
          </div>
        </SideSection>

        <SideSection title="EDUCATION">
          {data.education.map((e, i) => (
            <div key={i} style={{ marginBottom: "6px", fontSize: "7px", color: "#ddd" }}>
              <div style={{ fontWeight: "bold", color: "#fff" }}>{e.school}</div>
              <div>{e.level}</div>
              <div>{e.years}</div>
              <div>Percentage: {e.percentage}</div>
            </div>
          ))}
        </SideSection>

        <SideSection title="KEY SKILLS">
          {data.skills.technical.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: "4px", marginBottom: "2px", fontSize: "7px", color: "#ddd" }}>
              <span>▸</span><span>{s}</span>
            </div>
          ))}
        </SideSection>

        <SideSection title="PROJECTS">
          {data.projects.map((p, i) => (
            <div key={i} style={{ marginBottom: "5px", fontSize: "7px", color: "#ddd" }}>
              <div style={{ fontWeight: "bold", color: "#fff" }}>{p.name}</div>
              <div style={{ fontStyle: "italic" }}>{p.tech}</div>
            </div>
          ))}
        </SideSection>
      </div>

      {/* RIGHT CONTENT */}
      <div style={{ padding: "14px 12px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <Section4 title="SUMMARY">
          <p style={{ margin: 0, lineHeight: 1.6 }}>{data.summary}</p>
        </Section4>

        <Section4 title="WORK EXPERIENCE">
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: "bold" }}>{exp.company}</span>
                <span style={{ color: "#666", fontSize: "7px" }}>{exp.period}</span>
              </div>
              <div style={{ fontStyle: "italic", marginBottom: "3px", color: "#555" }}>{exp.role}</div>
              {exp.points.map((p, j) => <Bullet key={j} text={p} />)}
            </div>
          ))}
        </Section4>

        <Section4 title="EDUCATION">
          {data.education.map((e, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
              <div>
                <div style={{ fontWeight: "bold" }}>{e.level}</div>
                <div style={{ color: "#555" }}>{e.school}</div>
                <div style={{ color: "#555" }}>Percentage: {e.percentage}</div>
              </div>
              <div style={{ textAlign: "right", color: "#555" }}>{e.years}</div>
            </div>
          ))}
        </Section4>

        <Section4 title="ADDITIONAL INFORMATION">
          <Row label="Languages" value={data.additionalInfo.languages} />
          <Row label="Certifications" value={data.additionalInfo.certifications} />
        </Section4>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TEMPLATE 5 – Minimal right-aligned contact, clean sections
   Matches: Template 5 – DAVID ANDERSON, B.A GRADUATE / WEB DEVELOPER
   right-aligned contact info, ABOUT ME, EXPERIENCE, EDUCATION, KEY SKILLS
═══════════════════════════════════════════════════════════════════ */
export function Template5({ data = D }: { data?: ResumeData }) {
  return (
    <div
      id="resume-template-5"
      style={{
        fontFamily: "'Times New Roman', serif",
        fontSize: "8px",
        color: "#222",
        background: "#fff",
        width: "210mm",
        minHeight: "297mm",
        padding: "12mm 12mm",
        boxSizing: "border-box",
      }}
    >
      {/* Header – name left, contact right */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #111", paddingBottom: "8px", marginBottom: "10px" }}>
        <div>
          <div style={{ fontSize: "20px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "2px" }}>DAVID ANDERSON</div>
          <div style={{ fontSize: "8.5px", color: "#555", marginTop: "2px", textTransform: "uppercase", letterSpacing: "1px" }}>B.A GRADUATE / WEB DEVELOPER</div>
        </div>
        <div style={{ textAlign: "right", fontSize: "7.5px", color: "#555", lineHeight: 1.8 }}>
          <div>📞 {data.phone}</div>
          <div>✉ {data.email}</div>
          <div>🔗 {data.linkedin}</div>
          <div>📍 {data.location}</div>
        </div>
      </div>

      <Section5 title="ABOUT ME">
        <p style={{ margin: 0, lineHeight: 1.7 }}>{data.summary}</p>
      </Section5>

      <Section5 title="EXPERIENCE">
        {data.experience.map((exp, i) => (
          <div key={i} style={{ marginBottom: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: "bold" }}>{exp.company}</span>
              <span style={{ color: "#666", fontStyle: "italic" }}>{exp.period}</span>
            </div>
            <div style={{ fontStyle: "italic", marginBottom: "3px", color: "#555" }}>{exp.role}</div>
            {exp.points.map((p, j) => <Bullet key={j} text={p} />)}
          </div>
        ))}
      </Section5>

      <Section5 title="EDUCATION">
        {data.education.map((e, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <div>
              <div style={{ fontWeight: "bold" }}>{e.school}</div>
              <div style={{ color: "#555" }}>{e.level}</div>
              <div style={{ color: "#555" }}>Percentage: {e.percentage}</div>
            </div>
            <div style={{ textAlign: "right", color: "#555" }}>{e.years}</div>
          </div>
        ))}
      </Section5>

      <Section5 title="KEY SKILLS">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 20px" }}>
          {[...data.skills.technical, ...data.skills.soft].map((s, i) => <Bullet key={i} text={s} />)}
        </div>
      </Section5>

      <Section5 title="ADDITIONAL INFORMATION">
        <Row label="Languages" value={data.additionalInfo.languages} />
        <Row label="Certifications" value={data.additionalInfo.certifications} />
      </Section5>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SHARED HELPER COMPONENTS
═══════════════════════════════════════════════════════════════════ */
function Bullet({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", gap: "4px", marginBottom: "2px", alignItems: "flex-start" }}>
      <span style={{ marginTop: "1px", flexShrink: 0 }}>•</span>
      <span style={{ lineHeight: 1.5 }}>{text}</span>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: "6px", marginBottom: "2px" }}>
      <span style={{ fontWeight: "bold", flexShrink: 0 }}>{label}:</span>
      <span style={{ color: "#555", wordBreak: "break-word" }}>{value}</span>
    </div>
  );
}

function SubSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "4px" }}>
      <div style={{ fontWeight: "bold", fontSize: "7.5px", marginBottom: "2px", textDecoration: "underline" }}>{label}</div>
      {children}
    </div>
  );
}

function SideSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: "8px", fontWeight: "bold", color: "#aad4f5", textTransform: "uppercase", letterSpacing: "1px", borderBottom: "1px solid #444", paddingBottom: "2px", marginBottom: "5px" }}>{title}</div>
      {children}
    </div>
  );
}

// Section variants for each template style
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      {title && <div style={{ fontSize: "8.5px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.8px", borderBottom: "1px solid #333", paddingBottom: "2px", marginBottom: "5px" }}>{title}</div>}
      {children}
    </div>
  );
}

function Section2({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "8px" }}>
      <div style={{ fontSize: "8.5px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1.2px", color: "#111", borderBottom: "1.5px solid #111", paddingBottom: "2px", marginBottom: "5px" }}>{title}</div>
      {children}
    </div>
  );
}

function Section3({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "8px" }}>
      <div style={{ fontSize: "8.5px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", color: "#1a1a2e", borderBottom: "2px solid #1a1a2e", paddingBottom: "2px", marginBottom: "5px" }}>{title}</div>
      {children}
    </div>
  );
}

function Section4({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "8px" }}>
      <div style={{ fontSize: "8.5px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", color: "#333", borderBottom: "1px solid #bbb", paddingBottom: "2px", marginBottom: "5px" }}>{title}</div>
      {children}
    </div>
  );
}

function Section5({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "10px" }}>
      <div style={{ fontSize: "9px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1.5px", borderBottom: "1px solid #333", paddingBottom: "2px", marginBottom: "5px" }}>{title}</div>
      {children}
    </div>
  );
}