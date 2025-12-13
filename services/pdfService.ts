
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePDF = async (element: HTMLElement, fileName: string) => {
    // Basic config for html2canvas
    const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#020617', // Match the app's dark background
        ignoreElements: (el) => el.classList.contains('no-print') // Ignore buttons marked with 'no-print'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    // If content fits on one page
    if (pdfHeight <= pdf.internal.pageSize.getHeight()) {
         pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    } else {
        // Multi-page logic
        let heightLeft = pdfHeight;
        let position = 0;
        const pageHeight = pdf.internal.pageSize.getHeight();

        while (heightLeft > 0) {
             pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
             heightLeft -= pageHeight;
             position -= pageHeight; // Move the image up to show the next part
             
             // Add new page if there's more content
             if (heightLeft > 0) {
                 pdf.addPage();
             }
        }
    }
    
    pdf.save(`${fileName}.pdf`);
};
