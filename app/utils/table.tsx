/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

type TableProps = {
  columns: string[]
  data: Record<string, any>[]
}

export default function Table({ columns, data }: TableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md mt-5 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[#5252521C]">
            {columns.map((col, index) => (
              <th
                key={index}
                className={`px-4 py-3 text-sm font-normal text-[#282828] ${
                  col === "Subject" ? "text-left" : "text-center"
                }`}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={`hover:bg-gray-50 bg-[#FFFFFF] ${
                rowIndex !== data.length - 1 ? "border-b border-gray-200" : ""
              }`}
            >
              {columns.map((col, colIndex) => {
                const value = row[col]
                let cellContent

                switch (col) {
                  case "Today's Status": {
                    let bgColor = ""
                    let textColor = ""

                    switch (value) {
                      case "Present":
                        bgColor = "#43C17A3D"
                        textColor = "#00FF6F"
                        break
                      case "Absent":
                        bgColor = "#FFE0E0"
                        textColor = "#FF2020"
                        break
                      case "Late":
                        bgColor = "#FFEDDA"
                        textColor = "#FFBB70"
                        break
                      default:
                        bgColor = "#FFFFFF"
                        textColor = "#525252"
                    }

                    cellContent = (
                      <span
                        className="inline-flex justify-center items-center rounded-lg text-sm font-medium"
                        style={{
                          backgroundColor: bgColor,
                          color: textColor,
                          width: "100px",
                          height: "28px",
                        }}
                      >
                        {value}
                      </span>
                    )
                    break
                  }

                  case "Notes": {
                    cellContent = (
                      <div
                        className="inline-flex items-center justify-center rounded-full"
                        style={{
                          backgroundColor: "#6E4FE01A",
                          color: "#7557E3",
                          width: "25px",
                          height: "25px",
                        }}
                      >
                        {value}
                      </div>
                    )
                    break
                  }

                  default: {
                    cellContent = (
                      <span className="text-[#525252] text-sm">{value}</span>
                    )
                  }
                }

                return (
                  <td
                    key={colIndex}
                    className={`px-4 py-1 ${
                      col === "Subject" ? "text-left" : "text-center"
                    }`}
                  >
                    {cellContent}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
