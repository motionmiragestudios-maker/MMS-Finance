export function printInvoice(invoiceNumber: string) {
  const previousTitle = document.title;
  document.title = `Motion Mirage - ${invoiceNumber}`;

  const restoreTitle = () => {
    document.title = previousTitle;
  };

  window.addEventListener("afterprint", restoreTitle, { once: true });
  window.print();
}
