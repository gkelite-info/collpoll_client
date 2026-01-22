// ✅ app/academics/[category]/[id]/page.tsx

'use client'
import { use } from "react"
export default function DetailPage({
    params,
}: {
    params: Promise<{ category: string; id: string }>
}) {
    const { category, id } = use(params)
    return (
        <div>
            <h2>Details Page</h2>

            <p>Category: {category}</p>
            <p>ID: {id}</p>
        </div>
    )
}
