"use client";

const admins = [
  { id: 1, name: "Rohan Sharma", dept: "B.Tech (CSE)", image: "/rahul.png" },
  { id: 2, name: "Ananya Verma", dept: "B.Tech (CSE)", image: "/meenareddy.png" },
  { id: 3, name: "Karthik Reddy", dept: "B.Tech (CSE)", image: "/harshasharma.png" },
  { id: 4, name: "Sneha Patel", dept: "B.Tech (CSE)", image: "/sneha.png" },
  { id: 5, name: "Arjun Mehta", dept: "B.Tech (EEE)", image: "/faculty.png" },
  { id: 6, name: "Pooja Nair", dept: "B.Tech (EEE)", image: "/adityamenon.png" },
  { id: 7, name: "Nikhil Jain", dept: "B.Tech (EEE)", image: "/faculty.png" },
  { id: 8, name: "Aishwarya Kulkarni", dept: "B.Tech (EEE)", image: "/meenareddy.png" },
  { id: 9, name: "Rahul Singh", dept: "B.Tech (EEE)", image: "/rahul.png" },
];

export default function SelectAdminModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-[500px] max-h-[80vh] bg-white rounded-2xl shadow-xl overflow-y-auto p-6">
        <h2 className="text-xl font-semibold text-[#282828] mb-6">
          Select Admin
        </h2>

        <div className="space-y-5">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <img
                  src={admin.image}
                  alt={admin.name}
                  className="w-10 h-10 rounded-full object-cover"
                />

                <div>
                  <p className="font-medium text-[#282828]">
                    {admin.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {admin.dept}
                  </p>
                </div>
              </div>

              <input
                type="checkbox"
                className="w-5 h-5 accent-[#43C17A]"
              />
            </div>
          ))}
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={onClose}
            className="flex-1 bg-[#D9D9D9] text-[#282828] py-1 rounded-md font-medium cursor-pointer"
          >
            Cancel
          </button>

          <button className="flex-1 bg-[#43C17A] text-white py-1 rounded-md font-medium hover:opacity-90 transition cursor-pointer">
            Save
          </button>
        </div>

      </div>
    </div>
  );
}
