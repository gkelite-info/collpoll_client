import { useState } from "react";
import { Input, Select, TextArea } from "./ReusableComponents";

export default function AwardsForm() {
    const [description, setDescription] = useState<string>("");
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Input label="Award Name" placeholder="Best Coder Award" />
            <Input label="Issued By" placeholder="Google Developer Student Club" />
            <Input label="Date Received" placeholder="01/11/2024" />
            <Select label="Category (Optional)" options={["Hackathon", "Academic", "Sports", "Other"]} />
            <TextArea
                label="Description"
                onChange={(e ) => setDescription(e.target.value)}
                value={description}
                placeholder="Secured 1st place in a 24-hour hackathon for developing an AI chatbot for campus queries."
            />
        </div>
    );
}