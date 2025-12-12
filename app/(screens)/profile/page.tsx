import Internships from "./internships";
import KeySkills from "./KeySkills/keySkills";
import Languages from "./languages";
import ProfileSteps from "./profileSteps";

export default function Profile() {
    return (
        <div className="flex flex-col flex-1 h-[85vh]">
            <div><ProfileSteps /></div>
            <div className="flex-1">
                {/* <KeySkills/> */}
                {/* <Languages /> */}
                <Internships/>
            </div>
        </div>
    )
}