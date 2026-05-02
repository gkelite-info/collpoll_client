export type PlacementTabId =
  | "company-management"
  | "placement-drives"
  | "student-applications"
  | "results-offers";

export type PlacementTab = {
  id: PlacementTabId;
  label: string;
  description: string;
};

export type PlacementCompany = {
  id: number;
  name: string;
  subtitle?: string;
  role: string;
  description: string;
  longDescription: string;
  skills: string[];
  tags: string[];
  email: string;
  phone: string;
  website: string;
  packageDetails: string;
  driveType: string;
  driveTypeValue?: string;
  jobTypeValue?: string;
  workMode?: string;
  workModeValue?: string;
  eligibilityCriteria?: string;
  collegeEducationId?: number;
  educationTypeName?: string;
  collegeId?: number;
  collegeBranchId?: number;
  branchName?: string;
  collegeAcademicYearId?: number;
  academicYear?: string;
  createdBy?: number;
  createdAt?: string;
  placementCompanyIds?: number[];
  studentsPlaced: number;
  locations: string[];
  attachments: string[];
  logo: string;
  startDate?: string;
  endDate?: string;
  isExpired?: boolean;
};

export type PlacementDriveStat = {
  label: string;
  value: string;
  note: string;
  cardClass: string;
};

export type PlacementDrive = {
  id: number;
  driveName: string;
  companyName: string;
  date: string;
  branch: string;
  collegeId?: number;
  collegeEducationId?: number;
  educationTypeName?: string;
  collegeBranchId?: number;
  collegeAcademicYearId?: number;
  placementCompanyIds?: number[];
  role?: string;
  packageDetails?: string;
  isCompleted?: boolean;
  eligibleStudents: number;
  applied: number;
  placed: number;
  students: PlacementStudentRow[];
};

export type PlacementStudentRow = {
  id: number;
  studentName: string;
  studentId: string;
  branch: string;
  year: string;
  role: string;
  company: string;
  package: string;
  joiningDate: string;
  status: string;
  offerLetter?: string;
};

export type ChartBarItem = {
  label: string;
  value: number;
};

export const placementTabs: PlacementTab[] = [
  {
    id: "company-management",
    label: "Company Management",
    description:
      "Manage recruiting companies and keep all hiring information organized.",
  },
  {
    id: "placement-drives",
    label: "Placement Drives",
    description:
      "View, schedule, and manage all recruitment drives conducted in your institution.",
  },
  // Hidden from UI for now. Path: app/(screens)/placement/placements/components/StudentApplicationsView.tsx
  // {
  //   id: "student-applications",
  //   label: "Student Applications",
  //   description:
  //     "Track all student applications and shortlisting progress across placement drives.",
  // },
  {
    id: "results-offers",
    label: "Results & Offers",
    description:
      "Visual summary of student placements across companies and branches.",
  },
];

const placedStudents: PlacementStudentRow[] = [
  {
    id: 1,
    studentName: "Aarav Reddy",
    studentId: "ID64287492",
    branch: "CSE",
    year: "4th Year",
    role: "Software Engineer",
    company: "Infosys",
    package: "₹6.5 LPA",
    joiningDate: "10/09/2026",
    status: "Joined",
    offerLetter: "Offer_Letter",
  },
  {
    id: 2,
    studentName: "Priya Sharma",
    studentId: "ID64287493",
    branch: "CSE",
    year: "4th Year",
    role: "System Analyst",
    company: "TCS",
    package: "₹6.5 LPA",
    joiningDate: "10/09/2026",
    status: "Joined",
    offerLetter: "Offer_Letter",
  },
  {
    id: 3,
    studentName: "Rohit Kumar",
    studentId: "ID64287494",
    branch: "CSE",
    year: "4th Year",
    role: "Trainee Engineer",
    company: "Wipro",
    package: "₹6.5 LPA",
    joiningDate: "10/09/2026",
    status: "Joined",
    offerLetter: "Offer_Letter",
  },
  {
    id: 4,
    studentName: "Ananya Verma",
    studentId: "ID64287495",
    branch: "CSE",
    year: "4th Year",
    role: "Site Engineer",
    company: "Deloitte",
    package: "₹6.5 LPA",
    joiningDate: "10/09/2026",
    status: "Joined",
    offerLetter: "Offer_Letter",
  },
  {
    id: 5,
    studentName: "Sai Teja",
    studentId: "ID64287496",
    branch: "CSE",
    year: "4th Year",
    role: "Associate Analyst",
    company: "Infosys",
    package: "₹6.5 LPA",
    joiningDate: "10/09/2026",
    status: "Joined",
    offerLetter: "Offer_Letter",
  },
  {
    id: 6,
    studentName: "Aarav Reddy",
    studentId: "ID64287497",
    branch: "CSE",
    year: "4th Year",
    role: "Software Engineer",
    company: "TCS",
    package: "₹6.5 LPA",
    joiningDate: "10/09/2026",
    status: "Joined",
    offerLetter: "Offer_Letter",
  },
  {
    id: 7,
    studentName: "Aarav Reddy",
    studentId: "ID64287498",
    branch: "CSE",
    year: "4th Year",
    role: "System Analyst",
    company: "Wipro",
    package: "₹6.5 LPA",
    joiningDate: "10/09/2026",
    status: "Joined",
    offerLetter: "Offer_Letter",
  },
  {
    id: 8,
    studentName: "Priya Sharma",
    studentId: "ID64287499",
    branch: "CSE",
    year: "4th Year",
    role: "Trainee Engineer",
    company: "Deloitte",
    package: "₹6.5 LPA",
    joiningDate: "10/09/2026",
    status: "Joined",
    offerLetter: "Offer_Letter",
  },
  {
    id: 9,
    studentName: "Rohit Kumar",
    studentId: "ID64287500",
    branch: "CSE",
    year: "4th Year",
    role: "Associate Analyst",
    company: "Infosys",
    package: "₹6.5 LPA",
    joiningDate: "10/09/2026",
    status: "Joined",
    offerLetter: "Offer_Letter",
  },
  {
    id: 10,
    studentName: "Ananya Verma",
    studentId: "ID64287501",
    branch: "CSE",
    year: "4th Year",
    role: "Site Engineer",
    company: "TCS",
    package: "₹6.5 LPA",
    joiningDate: "10/09/2026",
    status: "Joined",
    offerLetter: "Offer_Letter",
  },
];

export const placementTabContent = {
  companyManagement: {
    companies: [
      {
        id: 1,
        name: "TCS",
        subtitle: "Tata Consultancy Services",
        role: "Software Engineer",
        description:
          "Work on designing, coding, and deploying enterprise-grade applications using modern frameworks. Collaborate with global teams to build scalable digital solutions and optimize performance.",
        longDescription:
          "TCS is a global IT services and consulting company supporting enterprise software, digital transformation, and scalable product delivery.",
        skills: ["Java", "Python", "Data Structures", "SQL"],
        tags: ["Part Time", "Full Time", "12 Lpa"],
        email: "careers@tcs.com",
        phone: "+91 9876543210",
        website: "www.tcs.com",
        packageDetails: "₹6.5 LPA to ₹12 LPA",
        driveType: "Virtual",
        studentsPlaced: 38,
        locations: ["Bengaluru", "Hyderabad", "Pune"],
        attachments: ["TCS-Drive-Plan.pdf", "TCS-Role-Description.pdf"],
        logo: "/tcs.png",
      },
      {
        id: 2,
        name: "Infosys",
        role: "Software Engineer",
        description:
          "Work on designing, coding, and deploying enterprise-grade applications using modern frameworks. Collaborate with global teams to build scalable digital solutions and optimize performance.",
        longDescription:
          "Infosys is a global leader in technology services and consulting, specializing in digital transformation, AI solutions, and enterprise software.",
        skills: ["Java", "Python", "Data Structures", "SQL"],
        tags: ["Full Time", "Hyderabad", "12 Lpa"],
        email: "infosys@infosys.com",
        phone: "+91 9076543210",
        website: "www.infosys.com",
        packageDetails: "₹6.5 LPA (avg), ₹8 LPA (max)",
        driveType: "Virtual",
        studentsPlaced: 45,
        locations: ["Bengaluru", "Hyderabad", "Pune"],
        attachments: ["Mou-Infosys-2026.pdf", "Drive-Report-Infosys.pdf"],
        logo: "/infosys.png",
      },
      {
        id: 3,
        name: "Amazon",
        role: "SDE Intern",
        description:
          "Work on designing, coding, and deploying enterprise-grade applications using modern frameworks. Collaborate with global teams to build scalable digital solutions and optimize performance.",
        longDescription:
          "Amazon offers engineering internships and early-career roles focused on customer-centric products, cloud systems, and distributed software development.",
        skills: ["Java", "Python", "Data Structures", "SQL"],
        tags: ["Full Time", "Hyderabad", "12 Lpa"],
        email: "students@amazon.com",
        phone: "+91 9988776655",
        website: "www.amazon.jobs",
        packageDetails: "₹12 LPA",
        driveType: "In Person",
        studentsPlaced: 12,
        locations: ["Hyderabad", "Chennai", "Bengaluru"],
        attachments: ["Amazon-SDE-Intern.pdf", "Amazon-Eligibility.pdf"],
        logo: "/amazon.png",
      },
    ] as PlacementCompany[],
  },
  placementDrives: {
    stats: [
      {
        label: "18",
        value: "18",
        note: "Total Drives",
        cardClass: "bg-[#FFE8CC]",
      },
      {
        label: "50",
        value: "50",
        note: "Active Drives",
        cardClass: "bg-[#DFF7E7]",
      },
      {
        label: "10",
        value: "10",
        note: "Completed Drives",
        cardClass: "bg-[#D8EAFE]",
      },
    ] as PlacementDriveStat[],
    drives: [
      {
        id: 1,
        driveName: "Infosys Campus Drive 2026",
        companyName: "Infosys",
        date: "20/09/2026",
        branch: "CSE, ECE",
        eligibleStudents: 180,
        applied: 150,
        placed: 40,
        students: placedStudents,
      },
      {
        id: 2,
        driveName: "TCS Digital Drive",
        companyName: "TCS",
        date: "25/09/2026",
        branch: "All Branch",
        eligibleStudents: 200,
        applied: 175,
        placed: 65,
        students: placedStudents,
      },
      {
        id: 3,
        driveName: "Wipro Virtual Hiring",
        companyName: "Wipro",
        date: "28/09/2026",
        branch: "MECH, EE",
        eligibleStudents: 120,
        applied: 100,
        placed: 20,
        students: placedStudents,
      },
      {
        id: 4,
        driveName: "Deloitte Drive 2026",
        companyName: "Deloitte",
        date: "2/09/2026",
        branch: "CSE",
        eligibleStudents: 80,
        applied: 65,
        placed: 65,
        students: placedStudents,
      },
      {
        id: 5,
        driveName: "Infosys Campus Drive 2026",
        companyName: "Infosys",
        date: "20/09/2026",
        branch: "CSE, ECE",
        eligibleStudents: 180,
        applied: 150,
        placed: 40,
        students: placedStudents,
      },
      {
        id: 6,
        driveName: "TCS Digital Drive",
        companyName: "TCS",
        date: "25/09/2026",
        branch: "All Branch",
        eligibleStudents: 200,
        applied: 175,
        placed: 65,
        students: placedStudents,
      },
      {
        id: 7,
        driveName: "Wipro Virtual Hiring",
        companyName: "Wipro",
        date: "28/09/2026",
        branch: "MECH, EE",
        eligibleStudents: 120,
        applied: 100,
        placed: 20,
        students: placedStudents,
      },
      {
        id: 8,
        driveName: "Deloitte Drive 2026",
        companyName: "Deloitte",
        date: "2/09/2026",
        branch: "CSE",
        eligibleStudents: 80,
        applied: 65,
        placed: 65,
        students: placedStudents,
      },
    ] as PlacementDrive[],
  },
  studentApplications: {
    students: [
      ...placedStudents,
      {
        id: 11,
        studentName: "Sai Teja",
        studentId: "ID64287502",
        branch: "CSE",
        year: "4th Year",
        role: "Site Engineer",
        company: "Wipro",
        package: "₹6.5 LPA",
        joiningDate: "10/09/2026",
        status: "Shortlisted",
        offerLetter: "Offer_Letter",
      },
      {
        id: 12,
        studentName: "Aarav Reddy",
        studentId: "ID64287503",
        branch: "CSE",
        year: "4th Year",
        role: "Associate Analyst",
        company: "Deloitte",
        package: "₹6.5 LPA",
        joiningDate: "10/09/2026",
        status: "Applied",
        offerLetter: "Offer_Letter",
      },
    ] as PlacementStudentRow[],
  },
  resultsOffers: {
    companyStats: [
      { label: "Infosys", value: 12 },
      { label: "TCS", value: 20 },
      { label: "Deloitte", value: 15 },
      { label: "Wipro", value: 42 },
      { label: "Accenture", value: 38 },
      { label: "L&T", value: 25 },
    ] as ChartBarItem[],
    branchStats: [
      { label: "CSE", value: 75 },
      { label: "EEE", value: 45 },
      { label: "ECE", value: 80 },
      { label: "MECH", value: 25 },
      { label: "IT", value: 50 },
    ] as ChartBarItem[],
    placedStudents,
  },
};
