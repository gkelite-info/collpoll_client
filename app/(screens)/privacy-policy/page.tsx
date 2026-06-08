export default function PrivacyPolicyPage() {
    return (
        <main className="min-h-screen bg-[#0f172a] text-slate-200 overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-3xl" />
                <div className="absolute bottom-0 left-0 h-[350px] w-[350px] rounded-full bg-emerald-500/10 blur-3xl" />
            </div>

            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
                    <div className="absolute -right-20 -top-20 h-[250px] w-[250px] rounded-full bg-blue-500/10 blur-3xl" />

                    <div className="px-6 py-12 sm:px-10 lg:px-16 lg:py-20">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-300">
                            🔒 Secure & Trusted Campus Platform
                        </div>

                        <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                            Privacy Policy
                        </h1>

                        <p className="mt-6 max-w-4xl text-base leading-8 text-slate-300 sm:text-lg">
                            Tekton Campus is committed to protecting the privacy,
                            security, and integrity of student, faculty, parent,
                            and institutional data. This Privacy Policy explains how
                            information is collected, used, stored, and protected
                            across our campus management platform and services.
                        </p>

                        <p className="mt-6 text-sm text-slate-400">
                            Last Updated: June 8, 2026
                        </p>
                    </div>
                </section>

                {/* Content */}
                <section className="mt-8 rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl sm:p-8 lg:p-12">
                    {/* Section */}
                    <PolicySection title="1. Information We Collect">
                        <p>
                            Tekton Campus collects information necessary to provide
                            educational, academic, administrative, financial,
                            and communication services.
                        </p>

                        <PolicyList
                            items={[
                                "Student details including attendance, academic records, assignments, schedules, and examination information.",
                                "Faculty and staff information related to HR, payroll, classes, schedules, and institutional management.",
                                "Parent and guardian details used for communication and student progress tracking.",
                                "Authentication and account-related information including login activity and security logs.",
                                "Technical information such as device type, browser information, usage analytics, and IP address.",
                            ]}
                        />

                        <HighlightBox>
                            <strong>Important:</strong> We only collect information
                            that is necessary for educational operations, platform
                            security, communication, and service improvement.
                        </HighlightBox>
                    </PolicySection>

                    <PolicySection title="2. How We Use Information">
                        <p>
                            The information collected through Tekton Campus is used
                            to manage and improve institutional operations and
                            platform functionality.
                        </p>

                        <PolicyList
                            items={[
                                "Managing attendance, assignments, exams, academics, schedules, and communication.",
                                "Providing secure login access with role-based permissions.",
                                "Supporting finance management, fee operations, HR activities, and placement workflows.",
                                "Sending notifications, alerts, announcements, and institutional updates.",
                                "Improving platform performance, reliability, and user experience.",
                            ]}
                        />
                    </PolicySection>

                    <PolicySection title="3. Data Security">
                        <p>
                            We follow industry-standard security practices to protect
                            user data against unauthorized access, misuse,
                            disclosure, or loss.
                        </p>

                        <PolicyList
                            items={[
                                "Secure authentication and encrypted communication.",
                                "Role-based access control to restrict sensitive data access.",
                                "Protected cloud infrastructure and monitored access management.",
                                "Audit logs and monitoring for important system operations.",
                                "Regular security reviews and platform maintenance practices.",
                            ]}
                        />

                        <HighlightBox>
                            <strong>Security Notice:</strong> While we implement
                            strong security measures, users are responsible for
                            maintaining the confidentiality of their account
                            credentials.
                        </HighlightBox>
                    </PolicySection>

                    <PolicySection title="4. Information Sharing">
                        <p>
                            Tekton Campus does not sell personal information to third
                            parties.
                        </p>

                        <p className="mt-4">
                            Information may only be shared under the following
                            conditions:
                        </p>

                        <PolicyList
                            items={[
                                "With authorized educational institutions using the platform.",
                                "When required by applicable laws, legal authorities, or regulations.",
                                "With trusted infrastructure or security service providers supporting the platform.",
                                "To prevent fraud, misuse, security threats, or unauthorized activities.",
                            ]}
                        />
                    </PolicySection>

                    <PolicySection title="5. User Rights & Access">
                        <PolicyList
                            items={[
                                "Users may request correction of inaccurate or outdated information.",
                                "Institutions may manage organizational data through authorized administrators.",
                                "Users may request account deactivation subject to institutional policies and legal obligations.",
                                "Access permissions are controlled according to assigned user roles.",
                            ]}
                        />
                    </PolicySection>

                    <PolicySection title="6. Cookies & Analytics">
                        <p>
                            Tekton Campus may use cookies and analytics technologies
                            to improve platform usability, maintain secure sessions,
                            and understand usage patterns.
                        </p>

                        <PolicyList
                            items={[
                                "Maintaining secure authentication sessions.",
                                "Improving platform speed and performance.",
                                "Understanding engagement and platform usage trends.",
                            ]}
                        />
                    </PolicySection>

                    <PolicySection title="7. Student & Minor Data">
                        <p>
                            Educational institutions using Tekton Campus are
                            responsible for ensuring that student data is collected
                            and managed in accordance with applicable educational and
                            privacy regulations.
                        </p>

                        <p className="mt-4">
                            Student information is processed only for authorized
                            academic, administrative, and institutional purposes.
                        </p>
                    </PolicySection>

                    <PolicySection title="8. Data Retention">
                        <p>
                            Data is retained only as long as necessary for
                            educational operations, institutional requirements,
                            security purposes, and legal compliance.
                        </p>

                        <p className="mt-4">
                            Certain records may remain archived for academic history,
                            auditing, and compliance requirements.
                        </p>
                    </PolicySection>

                    <PolicySection title="9. Changes to This Policy">
                        <p>
                            Tekton Campus may update this Privacy Policy periodically
                            to reflect service improvements, legal requirements, or
                            security updates.
                        </p>

                        <p className="mt-4">
                            Updated versions will be published on this page with the
                            revised date.
                        </p>
                    </PolicySection>

                    <PolicySection title="10. Contact Us">
                        <p>
                            If you have any questions or concerns regarding this
                            Privacy Policy, you may contact the Tekton Campus team
                            through the official platform.
                        </p>

                        <div className="mt-6 rounded-3xl border border-white/10 bg-[#111c36] p-6">
                            <p className="text-slate-300">
                                <span className="font-semibold text-white">
                                    Website:
                                </span>{" "}
                                https://tektoncampus.com/
                            </p>

                            <p className="mt-3 text-slate-300">
                                <span className="font-semibold text-white">
                                    Platform:
                                </span>{" "}
                                Tekton Campus
                            </p>

                            <p className="mt-3 text-slate-300">
                                <span className="font-semibold text-white">
                                    Purpose:
                                </span>{" "}
                                College Management & Academic Operations Platform
                            </p>
                        </div>
                    </PolicySection>
                </section>

                {/* Footer */}
                <footer className="pb-4 pt-8 text-center text-sm text-slate-400">
                    © 2026 Tekton Campus. All rights reserved.
                </footer>
            </div>
        </main>
    );
}

type PolicySectionProps = {
    title: string;
    children: React.ReactNode;
};

function PolicySection({
    title,
    children,
}: PolicySectionProps) {
    return (
        <section className="mb-14 last:mb-0">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {title}
            </h2>

            <div className="mt-5 space-y-4 text-[15px] leading-8 text-slate-300 sm:text-base">
                {children}
            </div>
        </section>
    );
}

function PolicyList({
    items,
}: {
    items: string[];
}) {
    return (
        <ul className="space-y-4 pl-5">
            {items.map((item) => (
                <li
                    key={item}
                    className="list-disc text-slate-300"
                >
                    {item}
                </li>
            ))}
        </ul>
    );
}

function HighlightBox({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="mt-6 rounded-3xl border border-blue-400/20 bg-gradient-to-br from-blue-500/10 to-emerald-500/10 p-6 text-slate-300">
            {children}
        </div>
    );
}