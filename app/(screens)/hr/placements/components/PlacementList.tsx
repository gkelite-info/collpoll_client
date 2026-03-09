import PlacementCard from "./PlacementCard";

export default function PlacementList() {
    return (
        <div className="flex flex-col gap-4">
            <PlacementCard
                logo="/tcs.png"
                company="TCS (Tata Consultancy Services)"
                role="Software Engineer"
                skills={["Java", "Python", "Data Structures", "SQL"]}
                description="Work on designing, coding, and deploying enterprise-grade applications using modern frameworks. Collaborate with global teams to build scalable digital solutions and optimize performance."
                tags={["Part Time", "Hyderabad", "12 Lpa"]}
            />

            <PlacementCard
                logo="/infosys.png"
                company="Infosys"
                role="Software Engineer"
                skills={["Java", "Python", "Data Structures", "SQL"]}
                description="Work on designing, coding, and deploying enterprise-grade applications using modern frameworks. Collaborate with global teams to build scalable digital solutions and optimize performance."
                tags={["Full Time", "Hyderabad", "12 Lpa"]}
            />

            <PlacementCard
                logo="/amazon.png"
                company="Amazon"
                role="SDE Intern"
                skills={["Java", "Python", "Data Structures", "SQL"]}
                description="Work on designing, coding, and deploying enterprise-grade applications using modern frameworks. Collaborate with global teams to build scalable digital solutions and optimize performance."
                tags={["Full Time", "Hyderabad", "12 Lpa"]}
            />

            <PlacementCard
                logo="/tcs.png"
                company="TCS (Tata Consultancy Services)"
                role="Software Engineer"
                skills={["Java", "Python", "Data Structures", "SQL"]}
                description="Work on designing, coding, and deploying enterprise-grade applications using modern frameworks. Collaborate with global teams to build scalable digital solutions and optimize performance."
                tags={["Part Time", "Hyderabad", "12 Lpa"]}
            />

            <PlacementCard
                logo="/infosys.png"
                company="Infosys"
                role="Software Engineer"
                skills={["Java", "Python", "Data Structures", "SQL"]}
                description="Work on designing, coding, and deploying enterprise-grade applications using modern frameworks. Collaborate with global teams to build scalable digital solutions and optimize performance."
                tags={["Full Time", "Hyderabad", "12 Lpa"]}
            />

            <PlacementCard
                logo="/amazon.png"
                company="Amazon"
                role="SDE Intern"
                skills={["Java", "Python", "Data Structures", "SQL"]}
                description="Work on designing, coding, and deploying enterprise-grade applications using modern frameworks. Collaborate with global teams to build scalable digital solutions and optimize performance."
                tags={["Full Time", "Hyderabad", "12 Lpa"]}
            />
        </div>
    );
}
