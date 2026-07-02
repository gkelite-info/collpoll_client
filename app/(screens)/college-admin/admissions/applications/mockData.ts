export type AdmissionRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  date: string;
  status: "Pending" | "Reviewed" | "Approved" | "Rejected";
};

const firstNames = ["Rahul", "Priya", "Amit", "Sneha", "Vikram", "Anjali", "Rohan", "Kavya", "Suresh", "Neha", "Karan", "Pooja", "Arjun", "Ritu", "Deepak"];
const lastNames = ["Sharma", "Patel", "Kumar", "Reddy", "Singh", "Gupta", "Verma", "Rao", "Nair", "Das", "Joshi", "Chawla", "Mehta", "Bose", "Menon"];
const courses = ["B.Tech Computer Science", "MBA Finance", "B.Sc Physics", "BBA", "B.Tech Mechanical", "M.Tech AI", "B.Com", "B.A. English"];
const statuses: AdmissionRecord["status"][] = ["Pending", "Reviewed", "Approved", "Rejected"];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateMockData(count: number): AdmissionRecord[] {
  const data: AdmissionRecord[] = [];
  const today = new Date();
  const pastYear = new Date();
  pastYear.setFullYear(today.getFullYear() - 1);

  for (let i = 1; i <= count; i++) {
    const fName = getRandomItem(firstNames);
    const lName = getRandomItem(lastNames);
    const course = getRandomItem(courses);
    const dateObj = getRandomDate(pastYear, today);
    const type = course.includes("B.Tech") || course.includes("B.Sc") ? "INTER" : course.includes("M.Tech") || course.includes("MBA") ? "PG" : "DEGREE";
    
    // Format date as DD MMM YYYY, HH:MM AM/PM
    const dateStr = dateObj.toLocaleDateString("en-US", { 
      day: "2-digit", 
      month: "short", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    data.push({
      id: `GK-${type}-${2026}-${i.toString().padStart(5, '0')}`,
      name: `${fName} ${lName}`,
      email: `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@example.com`,
      phone: `+91 ${Math.floor(6000000000 + Math.random() * 3999999999)}`,
      course,
      date: dateStr,
      status: getRandomItem(statuses),
    });
  }
  
  // Sort by most recent first roughly (just reversing since we didn't sort by date)
  return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export const mockAdmissionsData = generateMockData(250);
