import { NextRequest } from "next/server";
import OpenAI from "openai";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import jsPDF from "jspdf";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentType, companyInfo, format } = body;

    if (!documentType || !companyInfo) {
      return new Response(JSON.stringify({ error: "Missing required data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Generate document content using GPT-4o
    const system = `You are an expert legal document generator. Create a comprehensive, professional legal document based on the provided information. The document should be:

1. Legally sound and professional
2. Comprehensive with all necessary clauses and sections
3. Properly formatted with clear headings and structure
4. Tailored to the specific jurisdiction and business type
5. Include all standard legal language and protections
6. Be ready for execution by the parties

Format the document with proper structure:
- Use **BOLD** for document titles and section headers
- Use *ITALIC* for emphasis on important terms
- Use proper numbering for sections (1., 2., 3., etc.)
- Use lettering for subsections (a., b., c., etc.)
- Use bullet points (-) for lists
- Include proper spacing between sections

Return the document content in plain text format with the formatting markers above.`;

    const getDocumentSpecificInfo = () => {
      switch (documentType) {
        case "founder-agreement":
          return `
- Company Address: ${companyInfo.companyAddress || "Not specified"}
- Document Date: ${companyInfo.documentDate || "Not specified"}
- Effective Date: ${companyInfo.effectiveDate || "Not specified"}
- Equity Distribution: ${companyInfo.equityDistribution || "Not specified"}
- Roles and Responsibilities: ${companyInfo.rolesAndResponsibilities || "Not specified"}`;
        case "non-disclosure-agreement":
          return `
- Company Address: ${companyInfo.companyAddress || "Not specified"}
- Document Date: ${companyInfo.documentDate || "Not specified"}
- Effective Date: ${companyInfo.effectiveDate || "Not specified"}
- Disclosing Party: ${companyInfo.disclosingParty || "Not specified"}
- Receiving Party: ${companyInfo.receivingParty || "Not specified"}
- Confidential Information: ${companyInfo.confidentialInformation || "Not specified"}
- Disclosure Period: ${companyInfo.disclosurePeriod || "2 years"}`;
        case "employment-contract":
          return `
- Company Address: ${companyInfo.companyAddress || "Not specified"}
- Document Date: ${companyInfo.documentDate || "Not specified"}
- Effective Date: ${companyInfo.effectiveDate || "Not specified"}
- Employee Name: ${companyInfo.employeeName || "Not specified"}
- Employee Address: ${companyInfo.employeeAddress || "Not specified"}
- Employee Role: ${companyInfo.employeeRole || "Not specified"}
- Salary: ${companyInfo.salary || "Not specified"}
- Benefits: ${companyInfo.benefits || "Not specified"}
- Start Date: ${companyInfo.startDate || "Not specified"}`;
        case "equity-agreement":
          return `
- Company Address: ${companyInfo.companyAddress || "Not specified"}
- Document Date: ${companyInfo.documentDate || "Not specified"}
- Effective Date: ${companyInfo.effectiveDate || "Not specified"}
- Employee Name: ${companyInfo.employeeName || "Not specified"}
- Stock Options: ${companyInfo.stockOptions || "Not specified"}
- Exercise Price: ${companyInfo.exercisePrice || "Not specified"}
- Grant Date: ${companyInfo.startDate || "Not specified"}`;
        case "advisor-agreement":
          return `
- Company Address: ${companyInfo.companyAddress || "Not specified"}
- Document Date: ${companyInfo.documentDate || "Not specified"}
- Effective Date: ${companyInfo.effectiveDate || "Not specified"}
- Advisor Name: ${companyInfo.advisorName || "Not specified"}
- Advisor Address: ${companyInfo.advisorAddress || "Not specified"}
- Advisor Role: ${companyInfo.advisorRole || "Not specified"}
- Compensation: ${companyInfo.compensation || "Not specified"}
- Term: ${companyInfo.term || "1 year"}`;
        case "ip-assignment-agreement":
          return `
- Company Address: ${companyInfo.companyAddress || "Not specified"}
- Document Date: ${companyInfo.documentDate || "Not specified"}
- Effective Date: ${companyInfo.effectiveDate || "Not specified"}
- IP Owner: ${companyInfo.ipOwner || "Not specified"}
- IP Assignee: ${companyInfo.ipAssignee || "Not specified"}
- IP Description: ${companyInfo.ipDescription || "Not specified"}
- Assignment Scope: ${companyInfo.assignmentScope || "Not specified"}`;
        default:
          return "";
      }
    };

    const user = `Generate a ${documentType.replace("-", " ")} for:

Company Information:
- Company Name: ${companyInfo.companyName}
- Jurisdiction: ${companyInfo.jurisdiction}
- Capital Structure: ${companyInfo.capitalStructure}
- Founders: ${companyInfo.founders}
- Business Description: ${companyInfo.businessDescription}
- Vesting Schedule: ${companyInfo.vestingSchedule}
${getDocumentSpecificInfo()}
${companyInfo.specialProvisions ? `- Special Provisions: ${companyInfo.specialProvisions}` : ""}

Create a comprehensive, professional legal document that includes all necessary sections, clauses, and legal protections appropriate for this type of agreement. Use the specific information provided above to tailor the document content.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.3,
    });

    const content = completion.choices?.[0]?.message?.content ?? "";

    if (format === "docx") {
      // Parse and format the document content
      const parseDocumentContent = (content: string) => {
        const lines = content.split('\n');
        const children: any[] = [];
        
        for (const line of lines) {
          if (line.trim() === '') {
            children.push(new Paragraph({ children: [new TextRun({ text: "" })] }));
            continue;
          }
          
          // Handle bold text (**text**)
          if (line.includes('**')) {
            const parts = line.split(/(\*\*[^*]+\*\*)/g);
            const textRuns: any[] = [];
            
            for (const part of parts) {
              if (part.startsWith('**') && part.endsWith('**')) {
                const boldText = part.slice(2, -2);
                textRuns.push(new TextRun({
                  text: boldText,
                  bold: true,
                  size: 28,
                }));
              } else if (part.trim()) {
                textRuns.push(new TextRun({
                  text: part,
                  size: 24,
                }));
              }
            }
            
            children.push(new Paragraph({ children: textRuns }));
          }
          // Handle italic text (*text*)
          else if (line.includes('*') && !line.includes('**')) {
            const parts = line.split(/(\*[^*]+\*)/g);
            const textRuns: any[] = [];
            
            for (const part of parts) {
              if (part.startsWith('*') && part.endsWith('*')) {
                const italicText = part.slice(1, -1);
                textRuns.push(new TextRun({
                  text: italicText,
                  italics: true,
                  size: 24,
                }));
              } else if (part.trim()) {
                textRuns.push(new TextRun({
                  text: part,
                  size: 24,
                }));
              }
            }
            
            children.push(new Paragraph({ children: textRuns }));
          }
          // Regular text
          else {
            children.push(new Paragraph({
              children: [
                new TextRun({
                  text: line,
                  size: 24,
                }),
              ],
            }));
          }
        }
        
        return children;
      };

      // Generate DOCX document
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: parseDocumentContent(content),
          },
        ],
      });

      const buffer = await Packer.toBuffer(doc);
      return new Response(buffer as any, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="${documentType.replace("-", "_")}.docx"`,
        },
      });
    } else {
      // Generate PDF document
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;

      // Set font
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);

      // Split content into lines
      const lines = pdf.splitTextToSize(content, maxWidth);
      let yPosition = margin;

      // Add title
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      const title = documentType.replace("-", " ").toUpperCase();
      pdf.text(title, pageWidth / 2, yPosition, { align: "center" });
      yPosition += 20;

      // Add company info header
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("PARTIES:", margin, yPosition);
      yPosition += 10;
      
      pdf.setFont("helvetica", "normal");
      pdf.text(`Company: ${companyInfo.companyName}`, margin, yPosition);
      yPosition += 8;
      pdf.text(`Jurisdiction: ${companyInfo.jurisdiction}`, margin, yPosition);
      yPosition += 8;
      pdf.text(`Structure: ${companyInfo.capitalStructure}`, margin, yPosition);
      yPosition += 8;
      pdf.text(`Founders: ${companyInfo.founders}`, margin, yPosition);
      yPosition += 15;

      // Add main content with formatting
      pdf.setFontSize(10);
      for (const line of lines) {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        
        // Handle bold text (**text**)
        if (line.includes('**')) {
          const parts = line.split(/(\*\*[^*]+\*\*)/g);
          let xPosition = margin;
          
          for (const part of parts) {
            if (part.startsWith('**') && part.endsWith('**')) {
              const boldText = part.slice(2, -2);
              pdf.setFont("helvetica", "bold");
              pdf.text(boldText, xPosition, yPosition);
              xPosition += pdf.getTextWidth(boldText);
            } else if (part.trim()) {
              pdf.setFont("helvetica", "normal");
              pdf.text(part, xPosition, yPosition);
              xPosition += pdf.getTextWidth(part);
            }
          }
        }
        // Handle italic text (*text*)
        else if (line.includes('*') && !line.includes('**')) {
          const parts = line.split(/(\*[^*]+\*)/g);
          let xPosition = margin;
          
          for (const part of parts) {
            if (part.startsWith('*') && part.endsWith('*')) {
              const italicText = part.slice(1, -1);
              pdf.setFont("helvetica", "italic");
              pdf.text(italicText, xPosition, yPosition);
              xPosition += pdf.getTextWidth(italicText);
            } else if (part.trim()) {
              pdf.setFont("helvetica", "normal");
              pdf.text(part, xPosition, yPosition);
              xPosition += pdf.getTextWidth(part);
            }
          }
        }
        // Regular text
        else {
          pdf.setFont("helvetica", "normal");
          pdf.text(line, margin, yPosition);
        }
        
        yPosition += 6;
      }

      const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));
      return new Response(pdfBuffer as any, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${documentType.replace("-", "_")}.pdf"`,
        },
      });
    }
  } catch (error) {
    console.error("Legal document generation error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate legal document" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
