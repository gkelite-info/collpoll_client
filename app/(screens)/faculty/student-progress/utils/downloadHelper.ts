export function downloadSamplePDF() {
  const link = document.createElement("a");
  link.href = "/sample-pdf.pdf";
  link.download = "sample-pdf.pdf";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
