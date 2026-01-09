import { AcademicData } from "../page";

const data = [
  { degree: "B.Tech", dept: "CSE", year: "4 Years", sections: "A, B, C, D" },
  { degree: "B.Tech", dept: "IT", year: "4 Years", sections: "A, B" },
  { degree: "B.Sc", dept: "Mathematics", year: "3 Years", sections: "A" },
  { degree: "MBA", dept: "Finance", year: "2 Years", sections: "A" },
  { degree: "B.Tech", dept: "CSE", year: "4 Years", sections: "A, B, C, D" },
  { degree: "B.Tech", dept: "IT", year: "4 Years", sections: "A, B" },
  { degree: "B.Sc", dept: "Mathematics", year: "3 Years", sections: "A" },
  { degree: "MBA", dept: "Finance", year: "2 Years", sections: "A" },
];

export default function ViewAcademicStructure({
  onEdit,
}: {
  onEdit: (row: AcademicData) => void;
}) {
  return (
    <div className="w-[80%] mx-auto bg-white rounded-md shadow-lg overflow-hidden">
      <div className="max-h-[420px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 sticky top-0 z-10">
            <tr>
              <th className="p-4 text-left">Degree</th>
              <th className="p-4 text-left">Department</th>
              <th className="p-4 text-left">Year</th>
              <th className="p-4 text-left">Sections</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row, i) => (
              <tr
                key={i}
                className="hover:bg-gray-50 text-gray-800 transition"
              >
                <td className="p-4">{row.degree}</td>
                <td className="p-4">{row.dept}</td>
                <td className="p-4">{row.year}</td>
                <td className="p-4">{row.sections}</td>
                <td className="p-4 text-[#16284F] cursor-pointer underline" onClick={() => onEdit(row)}>
                  Edit
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
