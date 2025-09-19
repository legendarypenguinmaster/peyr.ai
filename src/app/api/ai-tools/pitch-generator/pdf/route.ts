import { NextRequest } from "next/server";
import jsPDF from "jspdf";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deck } = body;

    if (!deck || !deck.slides) {
      return new Response(JSON.stringify({ error: "No deck data provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create new PDF document
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    // Set up fonts and colors
    const primaryColor = [139, 69, 19]; // Purple color
    const textColor = [55, 65, 81]; // Gray-700
    const lightGray = [243, 244, 246]; // Gray-100

    // Helper function to add a slide
    const addSlide = (slide: { title: string; bullets: string[] }, slideNumber: number, totalSlides: number) => {
      if (slideNumber > 1) {
        pdf.addPage();
      }

      // Clear background
      pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      pdf.rect(0, 0, 297, 210, "F");

      // Add slide number
      pdf.setFontSize(10);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`${slideNumber} / ${totalSlides}`, 20, 20);

      // Add title
      pdf.setFontSize(24);
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.setFont("helvetica", "bold");
      
      const titleLines = pdf.splitTextToSize(slide.title, 250);
      pdf.text(titleLines, 148.5 - (pdf.getTextWidth(titleLines[0]) / 2), 60);

      // Add decorative line under title
      pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.setLineWidth(2);
      pdf.line(148.5 - 20, 70, 148.5 + 20, 70);

      // Add bullet points
      pdf.setFontSize(14);
      pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
      pdf.setFont("helvetica", "normal");

      let yPosition = 90;
      slide.bullets.forEach((bullet: string) => {
        if (yPosition > 180) {
          // If we run out of space, we could add a new page, but for now just stop
          return;
        }

        // Add bullet point
        pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        pdf.circle(30, yPosition - 2, 1, "F");

        // Add bullet text
        const bulletLines = pdf.splitTextToSize(bullet, 220);
        pdf.text(bulletLines, 40, yPosition);

        // Move to next position
        yPosition += bulletLines.length * 6 + 8;
      });

      // Add footer with deck title
      if (deck.title) {
        pdf.setFontSize(10);
        pdf.setTextColor(150, 150, 150);
        pdf.text(deck.title, 20, 200);
      }
    };

    // Add each slide
    deck.slides.forEach((slide: { title: string; bullets: string[] }, index: number) => {
      addSlide(slide, index + 1, deck.slides.length);
    });

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

    // Return PDF as base64 for frontend
    const base64 = pdfBuffer.toString("base64");
    const dataUrl = `data:application/pdf;base64,${base64}`;

    return new Response(JSON.stringify({ pdfDataUrl: dataUrl }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate PDF" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
