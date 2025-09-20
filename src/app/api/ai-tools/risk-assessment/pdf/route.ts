import { NextRequest } from "next/server";
import jsPDF from "jspdf";

export async function POST(request: NextRequest) {
  try {
    const { assessmentData, assessmentResults, riskScores } = await request.json();

    if (!assessmentData || !assessmentResults) {
      return new Response("Missing required data", { status: 400 });
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Helper function to add text with word wrapping
    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return y + (lines.length * fontSize * 0.4) + 5;
    };

    // Helper function to parse markdown-like formatting
    const parseMarkdownText = (text: string) => {
      return text
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markers
        .replace(/\*(.*?)\*/g, '$1') // Remove italic markers
        .replace(/^# (.*$)/gim, '$1') // Remove header markers
        .replace(/^- (.*$)/gim, '• $1') // Convert list items
        .replace(/\n\n/g, '\n') // Remove extra line breaks
        .trim();
    };

    // Title
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Risk Assessment Report", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 20;

    // Startup Information Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Startup Information", 20, yPosition);
    yPosition += 15;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    const infoItems = [
      { label: "Startup Idea:", value: assessmentData.startupIdea },
      { label: "Industry:", value: assessmentData.industry },
      { label: "Current Stage:", value: assessmentData.currentStage },
      { label: "Team Size:", value: assessmentData.teamSize },
      { label: "Funding Status:", value: assessmentData.fundingStatus },
      { label: "Target Market Size:", value: assessmentData.targetMarketSize },
      { label: "Competition Level:", value: assessmentData.competitionLevel },
      { label: "Business Model:", value: assessmentData.businessModel },
    ];

    for (const item of infoItems) {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFont("helvetica", "bold");
      doc.text(item.label, 20, yPosition);
      doc.setFont("helvetica", "normal");
      yPosition = addWrappedText(item.value, 20, yPosition, pageWidth - 40);
    }

    if (assessmentData.currentTraction) {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFont("helvetica", "bold");
      doc.text("Current Traction:", 20, yPosition);
      doc.setFont("helvetica", "normal");
      yPosition = addWrappedText(assessmentData.currentTraction, 20, yPosition, pageWidth - 40);
    }

    // Add new page for risk scores
    doc.addPage();
    yPosition = 20;

    // Risk Scores Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Risk Assessment Scores", 20, yPosition);
    yPosition += 15;

    if (riskScores) {
      // Main scores
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Overall Assessment:", 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      yPosition = addWrappedText(`Failure Risk Score: ${riskScores.failureRisk}%`, 20, yPosition, pageWidth - 40);
      yPosition = addWrappedText(`Success Probability: ${riskScores.successProbability}%`, 20, yPosition, pageWidth - 40);
      yPosition += 10;

      // Individual risk factors
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Individual Risk Factors:", 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      yPosition = addWrappedText(`Market Risk: ${riskScores.marketRisk}%`, 20, yPosition, pageWidth - 40);
      yPosition = addWrappedText(`Team Risk: ${riskScores.teamRisk}%`, 20, yPosition, pageWidth - 40);
      yPosition = addWrappedText(`Financial Risk: ${riskScores.financialRisk}%`, 20, yPosition, pageWidth - 40);
      yPosition = addWrappedText(`Execution Risk: ${riskScores.executionRisk}%`, 20, yPosition, pageWidth - 40);
      yPosition += 15;
    }

    // Add new page for detailed analysis
    doc.addPage();
    yPosition = 20;

    // Assessment Results Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Detailed Analysis", 20, yPosition);
    yPosition += 15;

    // Parse and add assessment results
    const parsedResults = parseMarkdownText(assessmentResults);
    const sections = parsedResults.split(/\n(?=\*\*)/).filter(section => section.trim());
    
    for (const section of sections) {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }

      const lines = section.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 20;
        }

        if (line.startsWith('**') && line.endsWith('**')) {
          // Section header
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          yPosition = addWrappedText(line.replace(/\*\*/g, ''), 20, yPosition, pageWidth - 40, 12);
        } else if (line.startsWith('•') || line.startsWith('-')) {
          // List item
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          yPosition = addWrappedText(line, 25, yPosition, pageWidth - 45);
        } else if (line.trim()) {
          // Regular text
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          yPosition = addWrappedText(line, 20, yPosition, pageWidth - 40);
        } else {
          // Empty line
          yPosition += 5;
        }
      }
      
      yPosition += 10; // Space between sections
    }

    // Footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Generated on ${new Date().toLocaleDateString()} - Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );
    }

    const pdfBuffer = Buffer.from(doc.output("arraybuffer") as ArrayBuffer);
    
    return new Response(pdfBuffer as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="risk-assessment-${assessmentData.startupIdea.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '-')}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return new Response("Failed to generate PDF", { status: 500 });
  }
}
