import { useEffect, useState } from "react";
import { AcademicData } from "../page";

export default function AddAcademicSetup({
    editData,
}: {
    editData: AcademicData | null;
}) {

    const [form, setForm] = useState({
        degree: "",
        dept: "",
        year: "",
        sections: "",
    });

    useEffect(() => {
        if (editData) {
            setForm(editData);
        }
    }, [editData]);
    return (
        <div className="bg-white rounded-xl p-6 space-y-6">
            <div>
                <label className="block text-sm text-[#16284F] font-medium mb-1">
                    Degree Type
                </label>
                <select
                    value={form.degree}
                    onChange={(e) => setForm({ ...form, degree: e.target.value })}
                    className="w-full border border-[#CCCCCC] text-[#2D3748] outline-none rounded-lg px-4 py-2">
                    <option>B.Tech</option>
                    <option>B.Sc</option>
                    <option>MBA</option>
                </select>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm text-[#16284F] font-medium mb-1">
                        Department
                    </label>
                    <select
                        value={form.dept}
                        onChange={(e) => setForm({ ...form, dept: e.target.value })}
                        className="w-full border border-[#CCCCCC] outline-none text-[#2D3748] rounded-lg px-4 py-2">
                        <option>CSE</option>
                        <option>IT</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm text-[#16284F] font-medium mb-1">
                        Year
                    </label>
                    <select
                        value={form.year}
                        onChange={(e) => setForm({ ...form, year: e.target.value })}
                        className="w-full border text-[#2D3748] outline-none border-[#CCCCCC] rounded-lg px-4 py-2">
                        <option>3 Years</option>
                        <option>4 Years</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6 items-center">
                <div>
                    <label className="block text-[#16284F] text-sm font-medium mb-1">
                        Sections
                    </label>
                    <select
                        value={form.sections}
                        onChange={(e) => setForm({ ...form, sections: e.target.value })}
                        className="w-full border border-[#CCCCCC] outline-none rounded-lg text-[#2D3748] px-4 py-2">
                        <option>A</option>
                        <option>B</option>
                        <option>C</option>
                    </select>
                </div>
                <button className="bg-[#43C17A] cursor-pointer text-white py-2.5 mt-6  rounded-lg font-semibold">
                    Save
                </button>
            </div>
        </div>
    );
}
