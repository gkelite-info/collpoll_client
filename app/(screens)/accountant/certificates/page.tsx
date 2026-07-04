import { Suspense } from "react";

import { CertificatesScreen } from "./components/CertificatesScreen";

export default function AccountantCertificatesPage() {
  return (
    <Suspense fallback={null}>
      <CertificatesScreen />
    </Suspense>
  );
}
