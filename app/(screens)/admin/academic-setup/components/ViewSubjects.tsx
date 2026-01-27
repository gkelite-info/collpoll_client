"use client";

export type SubjectViewData = {
  id: string;
  subjectName: string;
  degree: string;
  department: string;
};

export default function ViewSubjects({
  data, // 🔹 NEW
  onEdit,
}: {
  data: SubjectViewData[];
  onEdit: (row: SubjectViewData) => void;
}) {
  return (
    <div className="w-[80%] mx-auto bg-white rounded-md shadow-lg border border-gray-200">
      <div className="max-h-[420px] overflow-y-auto">
        <table className="w-full text-sm text-gray-800">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="p-4 text-left text-gray-700">Subject</th>
              <th className="p-4 text-left text-gray-700">Degree</th>
              <th className="p-4 text-left text-gray-700">Department</th>
              <th className="p-4 text-left text-gray-700">Action</th>
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">
                  No subjects found
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="p-4">{row.subjectName}</td>
                  <td className="p-4">{row.degree}</td>
                  <td className="p-4">{row.department}</td>
                  <td
                    className="p-4 underline cursor-pointer text-[#16284F]"
                    onClick={() => onEdit(row)}
                  >
                    Edit
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
