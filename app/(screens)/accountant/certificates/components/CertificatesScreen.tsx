"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { BonafideCertificatesScreen } from "./BonafideCertificatesScreen";
import { TransferCertificatesScreen } from "./TransferCertificatesScreen";

type CertificateTab = "bonafides" | "transfer-certificate";

export function CertificatesScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requestedType = searchParams.get("type")?.toLowerCase();
  const activeTab: CertificateTab =
    requestedType === "transfer-certificate" ? "transfer-certificate" : "bonafides";

  const selectTab = (value: CertificateTab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("type", value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <main className="min-h-full w-full overflow-x-hidden bg-[#F4F4F4] px-4 py-5 pb-8">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-5">
        {activeTab === "bonafides" ? (
          <BonafideCertificatesScreen
            onSelectTransferCertificate={() => selectTab("transfer-certificate")}
          />
        ) : (
          <TransferCertificatesScreen onSelectBonafides={() => selectTab("bonafides")} />
        )}
      </div>
    </main>
  );
}
