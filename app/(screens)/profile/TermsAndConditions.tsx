"use client";
import { ArrowLeft } from "@phosphor-icons/react";

type Props = {
    open: boolean;
    onClose: () => void;
};

export default function TermsModal({ open, onClose }: Props) {
    if (!open) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/30 z-200"/>
            <div
                onClick={onClose}
                className="fixed inset-0 z-210 flex items-center justify-center"
            >
                <div
                    className="bg-white w-[70%] h-[90vh] rounded-xl py-2 shadow-xl overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center gap-3 px-5 py-4 text-[#282828]">
                        <button onClick={onClose} className="cursor-pointer text-[#282828]">
                            <ArrowLeft size={22} />
                        </button>
                        <h2 className="text-base font-medium">
                            Terms And Conditions
                        </h2>
                    </div>

                    <div className="p-6 pt-2 overflow-y-auto text-sm text-[#525252] leading-relaxed max-h-[90vh]">
                        <ol className="list-decimal pl-12 space-y-4 text-[#525252] w-[90%]">
                            <li>
                                You shall abide by all terms and conditions of service
                                as shall be applicable from time to time.
                            </li>

                            <li>
                                You will be on probation initially up to three Months
                                (90 working days); however, your probation period can
                                be extended at the management discretion. You will
                                continue to be on probation until such time till you
                                receive the letter of confirmation.
                            </li>

                            <li>
                                During the probation or after confirmation, the
                                services may be terminated by either party giving
                                thirty days’ notice in writing or by giving thirty
                                days’ salary in lieu of notice. Such notice shall not
                                be deemed necessary in the case of termination of
                                services on the grounds of poor performance, refusal
                                to get relocated to any upcountry location as per the
                                organization requirement, willful neglect or breach
                                of trust, or any other serious derelictions of duty,
                                which are prejudicial to the interest of the Company.
                                In case of resignation, the Company reserves the
                                right to relieve you any time during the notice period
                                without payment of any compensation for the remaining
                                notice period.
                            </li>

                            <li>
                                Full and final payment of dues and other formalities
                                would be completed within 45 days after your last
                                working date.
                            </li>

                            <li>
                                In case of a resignation without notice, recovery
                                will be done for the shortfall in notice period. On
                                the contrary amount for notice period shall be
                                recovered from the dues (if any) payable to you. In
                                case there are no dues payable to you then an
                                independent recovery proceeding shall be initiated
                                against you at your cost. Relieving letter will be
                                issued only thereafter.
                            </li>

                            <li>
                                In case you do not report to office without prior
                                permission from your reporting manager for 3
                                consecutive days you will be tagged as absconding
                                from services. If you are declared absconding, the
                                shortfall of notice period will be recovered from the
                                dues payable to you.
                            </li>

                            <li>
                                In case of buy back, you agree that the decision to
                                buy back the notice period is entirely at the
                                discretion of the company and you do not have any
                                obligation for the company to do so.
                            </li>
                        </ol>
                    </div>
                </div>
            </div>
        </>
    );
}
