import { useState } from "react";
import { Input } from "./ReusableComponents";
import toast from "react-hot-toast";

export default function CertificationsForm({
  index,
  onSubmit,
}: {
  index: number;
  onSubmit: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    id: "",
    link: "",
    file: "",
    startDate: "",
    endDate: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    console.log(`certifications_${index + 1}`, form);
    onSubmit();
    toast.success(`Certification ${index + 1} submitted successfully`);
  };
  return (
    <div>
      <h3 className="text-base font-semibold text-[#282828] mb-4">
        Certification {index + 1}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Input label="Certification Name" name="name" value={form.name} onChange={handleChange} placeholder='Student Attendance Tracker", "AI Chatbot for College' />
        <Input label="Certification Completion ID" name="id" value={form.id} onChange={handleChange} placeholder="Web Development" />
        <Input label="Certificate Link" name="link" value={form.link} onChange={handleChange} placeholder="https://coursera.org/verify/xyz123" />
        <Input label="Upload Certificate" name="file" value={form.file} onChange={handleChange} placeholder="Certificate.png" />
        <Input label="Start Date" name="startDate" value={form.startDate} onChange={handleChange} placeholder="DD/MM/YYYY" />
        <Input label="End Date" name="endDate" value={form.endDate} onChange={handleChange} placeholder="DD/MM/YYYY" />
        <div className="md:col-span-2 flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-[#43C17A] cursor-pointer text-white px-6 py-2 rounded-md text-sm font-medium"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}