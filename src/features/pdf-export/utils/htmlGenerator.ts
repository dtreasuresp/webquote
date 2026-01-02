import jsPDF from 'jspdf';

/**
 * Generates a PDF from an HTML element ID.
 * This utility uses the built-in html method of jsPDF.
 * Note: For best results, html2canvas should be available in the environment.
 */
export const generatePdfFromHtml = async (elementId: string, fileName: string = 'cotizacion.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  try {
    await doc.html(element, {
      callback: function (doc) {
        doc.save(fileName);
      },
      x: 10,
      y: 10,
      width: 190, // A4 width is 210mm, minus margins
      windowWidth: 800, // Width of the virtual window to render the HTML
    });
  } catch (error) {
    console.error('Error generating PDF from HTML:', error);
    throw error;
  }
};
