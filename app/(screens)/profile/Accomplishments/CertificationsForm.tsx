import { Input } from "./ReusableComponents";

export default function CertificationsForm() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Input label="Certification Name" placeholder='Student Attendance Tracker", "AI Chatbot for College' />
      <Input label="Certification Completion ID" placeholder="Web Development" />
      <Input label="Certificate Link" placeholder="https://coursera.org/verify/xyz123" />
      <Input label="Upload Certificate" placeholder="Certificate.png" />
      <Input label="Start Date" placeholder="DD/MM/YYYY" />
      <Input label="End Date" placeholder="DD/MM/YYYY" />
    </div>
  );
}