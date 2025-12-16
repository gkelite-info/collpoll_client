import { useState } from "react";
import { Input, TextArea } from "./ReusableComponents";

export default function ClubsForm() {
    const [description, setDescription] = useState<string>("");
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Input label="Club/Committee Name" placeholder="Google Developer Student Club" />
            <Input label="Role/Position Held" placeholder="Core Member" />
            <div className="md:col-span-2">
                <p className="text-sm font-medium mb-2">Duration</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Input label="From" placeholder="01/10/2024" />
                    <Input label="To" placeholder="01/11/2024" />
                </div>
            </div>
            <TextArea
                label="Description"
                onChange={(e) => setDescription(e.target.value)}
                value={description}
                placeholder="Organized workshop on AI and Cloud Computing for 200+ Students"
            />
        </div>
    );
}