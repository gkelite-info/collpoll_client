// ─── EducationConstants.ts ────────────────────────────────────────────────────
// All static data arrays used by ResumeEducationForm

// ─── Board options ─────────────────────────────────────────────────────────────
export const ALL_INDIA_BOARDS = [
  "CBSE",
  "CISCE(ICSE/ISC)",
  "Diploma",
  "National Open School",
  "IB(International Baccalaureate)",
];

export const STATE_BOARDS = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "J & K",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

// ─── Medium options ────────────────────────────────────────────────────────────
export const MEDIUM_OPTIONS = [
  "Assamese / Asomiya",
  "Bengali / Bangla",
  "English",
  "Gujarati",
  "Hindi",
  "Kannada",
  "Kashmiri",
  "Konkani",
  "Malayalam",
  "Manipuri",
  "Marathi",
  "Punjabi",
  "Sanskrit",
  "Tamil",
  "Telugu",
  "Urdu",
];

// ─── Secondary Specialization Options ─────────────────────────
export const SECONDARY_SPECIALIZATIONS = [
  // ─── Inter (10+2) Streams ───
  "MPC", 
  "BiPC", 
  "CEC ",
  "HEC", 
  "MEC" ,
  "Arts / Humanities",
  "Science",
  "Commerce",

  // ─── Diploma Specializations ───
  "Mechanical Engineering [ME]",
  "Civil Engineering [CE]",
  "Electrical & Electronics Engineering [EEE]",
  "Electronics & Communication Engineering [ECE]",
  "Computer Science Engineering [CSE]",
  "Information Technology [IT]",

  // ─── Vocational Specializations ───
  "Agriculture Science [AS]",
  "Computer Applications [CA]",
  "Electronics [EL]",
  "Healthcare [HC]",
  "Retail [RT]",
  "Tourism [TS]",
  "Automobile [AT]",
  "Fashion Designing [FD]",

  // ─── ITI Specializations ───
  "Electrician [EL]",
  "Fitter [FT]",
  "Welder [WL]",
  "Mechanic [MC]",
  "Turner [TR]",
  "Carpenter [CP]",
  "Plumber [PL]",
  "Computer Operator [CO]",
  "Draughtsman [DR]",

  // ─── General / Others ───
  "Open Schooling",
  "NIOS",
];

// ─── Undergraduate ────────────────────────────────────────────────────────────
export const UNDERGRADUATE_COURSES = [
  // ─── Engineering / Technology ───
  "B.Tech / B.E",
  // ─── Science ───
  "B.Sc",
  // ─── Commerce / Business ───
  "B.Com",
  "BBA",
  "BMS",
  // ─── Arts / Humanities ───
  "BA",
  // ─── Computer / IT ───
  "BCA",
  // ─── Design / Creative ───
  "B.Des",
  "BFA",
  // ─── Law ───
  "LLB",
  "BA LLB",
  "BBA LLB",
  "B.Com LLB",
  // ─── Medical / Health ───
  "MBBS",
  "BDS",
  "B.Pharm",
  "BPT",
  "BAMS",
  "BHMS",
  "B.Sc Nursing",
  "B.Sc Paramedical",
  // ─── Hotel / Tourism ───
  "BHM",
  "BTTM",
  // ─── Education ───
  "B.Ed",
  "B.El.Ed",
  // ─── Agriculture ───
  "B.Sc Agriculture",
  // ─── Aviation / Maritime ───
  "B.Sc Aviation",
  "B.Sc Nautical Science",
  // ─── Others ───
  "Integrated Courses",
  "Open Degree",
  "Distance Education",
];

export const UNDERGRADUATE_SPECIALIZATIONS = [
  // ─── Engineering ───
  "Computer Science Engineering (CSE)",
  "Information Technology (IT)",
  "Artificial Intelligence & Machine Learning (AI & ML)",
  "Data Science & Analytics (DSA)",
  "Cyber Security (CYBER)",
  "Mechanical Engineering [ME]",
  "Civil Engineering [CE]",
  "Electrical Engineering [EE]",
  "Electronics & Communication Engineering [ECE]",
  "Electronics & Electrical Engineering [EEE]",
  "Robotics Engineering [RE]",
  "Mechatronics Engineering [MECHATRONICS]",
  "Aerospace Engineering [AERO]",
  "Automobile Engineering [AUTO]",
  "Chemical Engineering [CHEM]",
  "Biotechnology Engineering [BIOTECH]",
  "Agricultural Engineering [AGRI]",
  // ─── Science ───
  "Mathematics / Applied Mathematics [MATH]",
  "Physics [PHY]",
  "Chemistry [CHEM]",
  "Computer Science [CS]",
  "Statistics [STAT]",
  "Biotechnology [BIOTECH]",
  "Microbiology [MCR]",
  "Environmental Science [ENV]",
  "Forensic Science [FOR]",
  // ─── Commerce / Business ───
  "Accounting [ACC]",
  "Finance [FIN]",
  "Banking [BANK]",
  "Insurance [INS]",
  "Taxation [TAX]",
  "Marketing [MKT]",
  "Human Resource Management [HR]",
  "International Business [IB]",
  "Business Analytics [BA]",
  // ─── Arts / Humanities ───
  "English Literature [ENG]",
  "History [HIST]",
  "Political Science [POL]",
  "Economics [ECON]",
  "Sociology [SOC]",
  "Psychology [PSY]",
  "Journalism [JRN]",
  "Mass Communication [MC]",
  "Public Administration [PA]",
  // ─── Design / Creative ───
  "Fashion Design [FD]",
  "Interior Design [ID]",
  "Graphic Design [GD]",
  "Product Design [PD]",
  "Animation [ANIM]",
  "Visual Effects (VFX) [VFX]",
  "UI/UX Design [UI/UX]",
  // ─── Medical / Health ───
  "General Medicine [GM]",
  "Dentistry [DT]",
  "Pharmacy [PH]",
  "Physiotherapy [PT]",
  "Radiology [RD]",
  "Medical Lab Technology [MLT]",
  "Nursing [NRS]",
  // ─── Law ───
  "Corporate Law [CORP]",
  "Criminal Law [CRIM]",
  "Civil Law [CIV]",
  "International Law [INTL]",
  // ─── Hotel / Tourism ───
  "Hotel Management [HOT]",
  "Hospitality Management [HOSP]",
  "Tourism Management [TOUR]",
  // ─── Agriculture ───
  "Agriculture [AGRI]",
  "Horticulture [HORT]",
  "Forestry [FORE]",
  "Fisheries [FISH]",
  // ─── Others ───
  "General [GEN]",
];

// ─── Masters ──────────────────────────────────────────────────────────────────
export const MASTERS_COURSES = [
  // ─── Engineering / Technology ───
  "M.Tech / M.E",
  // ─── Science ───
  "M.Sc",
  // ─── Commerce / Business ───
  "M.Com",
  "MBA",
  "PGDM",
  // ─── Arts / Humanities ───
  "MA",
  // ─── Computer / IT ───
  "MCA",
  // ─── Design / Creative ───
  "M.Des",
  "MFA",
  // ─── Law ───
  "LLM",
  // ─── Medical / Health ───
  "MD",
  "MS",
  "MDS",
  "M.Pharm",
  "MPT",
  "M.Sc Nursing",
  // ─── Education ───
  "M.Ed",
  // ─── Agriculture ───
  "M.Sc Agriculture",
  // ─── Others ───
  "Integrated Postgraduate",
  "Distance Education",
];

export const MASTERS_SPECIALIZATIONS = [
  // ─── Engineering / Technology ───
  "Computer Science Engineering [CSE]",
  "Artificial Intelligence [AI]",
  "Artificial Intelligence & Machine Learning [AI & ML]",
  "Data Science [DSA]",
  "Cyber Security [CYBER]",
  "Information Technology [IT]",
  "Software Engineering [SW]",
  "VLSI Design [VLSI]",
  "Embedded Systems [ES]",
  "Communication Systems [CS]",
  "Signal Processing [SP]",
  "Power Systems [PS]",
  "Control Systems [CS]",
  "Thermal Engineering [TE]",
  "Manufacturing Engineering [ME]",
  "Industrial Engineering [IE]",
  "Structural Engineering [SE]",
  "Geotechnical Engineering [GE]",
  "Transportation Engineering [TE]",
  "Environmental Engineering [EE]",
  "Water Resources Engineering [WRE]",
  "Robotics & Automation [ROBOT]",
  "Mechatronics [MECHATRONICS]",
  "Aerospace Engineering [AERO]",
  "Automobile Engineering [AUTO]",
  "Chemical Engineering [CHEM]",
  "Biotechnology Engineering [BIOTECH]",
  // ─── Science ───
  "Mathematics [MATH]",
  "Applied Mathematics [APPMATH]",
  "Physics [PHY]",
  "Chemistry [CHEM]",
  "Organic Chemistry [ORGCHEM]",
  "Analytical Chemistry [ANALCHEM]",
  "Computer Science [CS]",
  "Data Analytics [DSA]",
  "Statistics [STAT]",
  "Biotechnology [BIOTECH]",
  "Microbiology [MCR]",
  "Biochemistry [BIOCHEM]",
  "Environmental Science [ENV]",
  "Forensic Science [FOR]",
  "Food Science & Technology [FOOD]",
  // ─── Commerce / Management ───
  "Accounting [ACC]",
  "Finance [FIN]",
  "Banking & Finance [BANK]",
  "Taxation [TAX]",
  "Business Analytics [BA]",
  "International Business [IB]",
  "Marketing [MKT]",
  "Human Resource Management [HR]",
  "Operations Management [OPM]",
  "Entrepreneurship [ENT]",
  "Supply Chain Management [SCM]",
  "Retail Management [RT]",
  "Hospital Management [HOSP]",
  "Healthcare Management [HC]",
  "Digital Marketing [DM]",
  // ─── Arts / Humanities ───
  "English Literature [ENG]",
  "History [HIST]",
  "Political Science [POLSCI]",
  "Economics [ECON]",
  "Sociology [SOC]",
  "Psychology [PSY]",
  "Philosophy [PHIL]",
  "Journalism [JOUR]",
  "Mass Communication [MASSCOMM]",
  "Public Administration [PUBADM]",
  "Geography [GEO]",
  "Linguistics [LING]",
  // ─── Computer / IT ───
  "Computer Applications [COMP]",
  "Cloud Computing [CLOUD]",
  "Full Stack Development [FULLSTACK]",
  // ─── Design / Creative ───
  "Fashion Design [FASH]",
  "Interior Design [INT]",
  "Graphic Design [GRPH]",
  "UI/UX Design [UI/UX]",
  "Animation [ANIM]",
  "Visual Effects (VFX) [VFX]",
  "Product Design [PROD]",
  "Painting [PAINT]",
  "Sculpture [SCULPT]",
  "Applied Arts [APPL]",
  "Printmaking [PRINT]",
  "Photography [PHOTO]",
  // ─── Law ───
  "Corporate Law [CORP]",
  "Criminal Law [CRIM]",
  "Constitutional Law [CON]",
  "International Law [INTL]",
  "Intellectual Property Law [IP]",
  "Taxation Law [TAX]",
  // ─── Medical / Health ───
  "General Medicine [GENMED]",
  "Pediatrics [PED]",
  "Dermatology [DERM]",
  "Radiology [RAD]",
  "Anesthesiology [ANEST]",
  "Pharmacology [PHARM]",
  "Physiology [PHY]",
  "Pathology [PATH]",
  "Microbiology (Medical) [MICRO]",
  "General Surgery [GENSURG]",
  "Orthopedics [ORTHO]",
  "Ophthalmology [OPHTH]",
  "ENT [ENT]",
  "Obstetrics & Gynecology [OBST]",
  "Orthodontics [ORTHDONT]",
  "Oral Surgery [ORALSURG]",
  "Periodontics [PERIODONT]",
  "Prosthodontics [PRODONT]",
  "Pedodontics [PEDONT]",
  "Pharmaceutics [PHARM]",
  "Pharmaceutical Chemistry [PHARMCHEM]",
  "Pharmacy Practice [PHARM]",
  "Quality Assurance [QA]",
  "Physiotherapy [PHY]",

  "Orthopedic Physiotherapy [ORTHPHY]",
  "Neurological Physiotherapy [NEUROPHY]",
  "Sports Physiotherapy [SPORTPHY]",
  "Cardiopulmonary Physiotherapy [CARDIPHYS]",
  "Medical-Surgical Nursing [MEDSURG]",
  "Pediatric Nursing [PED]",
  "Obstetric & Gynecological Nursing [OBST]",
  "Community Health Nursing [COMM]",
  "Mental Health Nursing [MENTAL]",
  "Critical Care Nursing [CRITICAL]",
  // ─── Education ───
  "Educational Administration [EDUADMIN]",
  "Curriculum & Instruction [CURRIC]",
  "Special Education [SPEDEDU]",
  "Educational Technology [EDUTECH]",
  "Guidance & Counselling [GUIDANCE]",
  // ─── Agriculture ───
  "Agronomy [AGRON]",
  "Horticulture [HORT]",
  "Soil Science [SOIL]",
  "Plant Pathology [PLANTPATH]",
  "Agricultural Economics [AGRECON]",
  "Agricultural Engineering [AGRENG]",
  // ─── Others ───
  "General",
];

// ─── Year options: 5 future years + 50 past years, auto-updates every year ────
const currentYear = new Date().getFullYear();
export const YEAR_OPTIONS = Array.from(
  { length: 56 },
  (_, i) => String(currentYear + 5 - i) // starts from currentYear+5 down to currentYear-50
);