"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import FounderAgreementForm from "@/components/ai-tools/legal-generator/FounderAgreementForm";
import NonDisclosureAgreementForm from "@/components/ai-tools/legal-generator/NonDisclosureAgreementForm";
import EmploymentContractForm from "@/components/ai-tools/legal-generator/EmploymentContractForm";
import EquityAgreementForm from "@/components/ai-tools/legal-generator/EquityAgreementForm";
import AdvisorAgreementForm from "@/components/ai-tools/legal-generator/AdvisorAgreementForm";
import IpAssignmentAgreementForm from "@/components/ai-tools/legal-generator/IpAssignmentAgreementForm";

type Step = "document-type" | "company-info" | "generate" | "review";

export interface CompanyInfo {
  companyName: string;
  jurisdiction: string;
  founders: string;
  businessDescription: string;
  capitalStructure: string;
  vestingSchedule: string;
  specialProvisions: string;
  // Common fields
  companyAddress?: string;
  documentDate?: string;
  effectiveDate?: string;
  // Document-specific fields
  equityDistribution?: string;
  rolesAndResponsibilities?: string;
  confidentialInformation?: string;
  disclosurePeriod?: string;
  employeeRole?: string;
  salary?: string;
  benefits?: string;
  startDate?: string;
  stockOptions?: string;
  exercisePrice?: string;
  advisorRole?: string;
  compensation?: string;
  term?: string;
  ipDescription?: string;
  assignmentScope?: string;
  // Additional fields for specific documents
  employeeName?: string;
  employeeAddress?: string;
  advisorName?: string;
  advisorAddress?: string;
  disclosingParty?: string;
  receivingParty?: string;
  ipOwner?: string;
  ipAssignee?: string;
}

export default function LegalGeneratorClient() {
  const [step, setStep] = useState<Step>("document-type");
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>("");
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    companyName: "",
    jurisdiction: "Delaware, USA",
    founders: "",
    businessDescription: "",
    capitalStructure: "C-Corporation",
    vestingSchedule: "4 years, 1 year cliff",
    specialProvisions: "",
    // Common fields
    companyAddress: "",
    documentDate: new Date().toISOString().split('T')[0],
    effectiveDate: new Date().toISOString().split('T')[0],
    // Document-specific fields
    equityDistribution: "",
    rolesAndResponsibilities: "",
    confidentialInformation: "",
    disclosurePeriod: "2 years",
    employeeRole: "",
    salary: "",
    benefits: "",
    startDate: "",
    stockOptions: "",
    exercisePrice: "",
    advisorRole: "",
    compensation: "",
    term: "1 year",
    ipDescription: "",
    assignmentScope: "",
    // Additional fields
    employeeName: "",
    employeeAddress: "",
    advisorName: "",
    advisorAddress: "",
    disclosingParty: "",
    receivingParty: "",
    ipOwner: "",
    ipAssignee: "",
  });
  const [selectedFormat, setSelectedFormat] = useState<"docx" | "pdf">("docx");
  const [generating, setGenerating] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState<string | null>(null);

  const documentTypes = [
    {
      id: "founder-agreement",
      title: "Founder Agreement",
      description: "Define roles, responsibilities, and equity distribution among co-founders",
      icon: "🤝",
    },
    {
      id: "non-disclosure-agreement",
      title: "Non-Disclosure Agreement",
      description: "Protect confidential information and trade secrets",
      icon: "🔒",
    },
    {
      id: "employment-contract",
      title: "Employment Contract",
      description: "Standard employment terms and conditions for team members",
      icon: "👔",
    },
    {
      id: "equity-agreement",
      title: "Equity Agreement",
      description: "Stock options, vesting schedules, and equity terms",
      icon: "📈",
    },
    {
      id: "advisor-agreement",
      title: "Advisor Agreement",
      description: "Terms for advisors, consultants, and board members",
      icon: "🎯",
    },
    {
      id: "ip-assignment-agreement",
      title: "IP Assignment Agreement",
      description: "Intellectual property ownership and assignment terms",
      icon: "💡",
    },
  ];

  // Sync step with URL hash
  useEffect(() => {
    const currentHash = (typeof window !== "undefined" && window.location.hash.replace("#", "")) as Step;
    if (["document-type", "company-info", "generate", "review"].includes(currentHash)) {
      setStep(currentHash);
    } else if (typeof window !== "undefined") {
      // default to document-type if no hash
      window.location.hash = "document-type";
      setStep("document-type");
    }
    const onHashChange = () => {
      const h = window.location.hash.replace("#", "") as Step;
      if (["document-type", "company-info", "generate", "review"].includes(h)) setStep(h);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const go = (s: Step) => {
    if (typeof window !== "undefined") {
      window.location.hash = s;
      setStep(s);
    }
  };

  const updateCompanyInfo = (field: keyof CompanyInfo, value: string) => {
    setCompanyInfo(prev => ({ ...prev, [field]: value }));
  };

  const getDocumentForm = () => {
    switch (selectedDocumentType) {
      case "founder-agreement":
        return <FounderAgreementForm companyInfo={companyInfo} updateCompanyInfo={updateCompanyInfo} />;
      case "non-disclosure-agreement":
        return <NonDisclosureAgreementForm companyInfo={companyInfo} updateCompanyInfo={updateCompanyInfo} />;
      case "employment-contract":
        return <EmploymentContractForm companyInfo={companyInfo} updateCompanyInfo={updateCompanyInfo} />;
      case "equity-agreement":
        return <EquityAgreementForm companyInfo={companyInfo} updateCompanyInfo={updateCompanyInfo} />;
      case "advisor-agreement":
        return <AdvisorAgreementForm companyInfo={companyInfo} updateCompanyInfo={updateCompanyInfo} />;
      case "ip-assignment-agreement":
        return <IpAssignmentAgreementForm companyInfo={companyInfo} updateCompanyInfo={updateCompanyInfo} />;
      default:
        return null;
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const res = await fetch("/api/ai-tools/legal-generator/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: selectedDocumentType,
          companyInfo,
          format: selectedFormat,
        }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setGeneratedDocument(url);
      go("review");
    } catch (error) {
      console.error("Document generation failed:", error);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedDocument) {
      const link = document.createElement("a");
      link.href = generatedDocument;
      link.download = `${selectedDocumentType.replace("-", "_")}.${selectedFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const Stepper = () => (
    <div className="sticky top-[68px] z-10 bg-white/70 backdrop-blur border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-3 text-sm">
          {([
            { key: "document-type", label: "Document Type" },
            { key: "company-info", label: "Company Info" },
            { key: "generate", label: "Generate" },
            { key: "review", label: "Review" },
          ] as { key: Step; label: string }[]).map((s, idx, arr) => (
            <div key={s.key} className="flex items-center gap-3">
              <button onClick={() => go(s.key)} className={`h-7 w-7 rounded-full text-xs font-semibold flex items-center justify-center ${step === s.key ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}>{idx + 1}</button>
              <span className={`text-sm ${step === s.key ? "text-gray-900" : "text-gray-500"}`}>{s.label}</span>
              {idx < arr.length - 1 && <div className="h-px w-10 sm:w-20 bg-gray-200" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <DashboardHeader />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Legal Document Generator</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">Generate professional legal documents with AI</p>
        </div>

        <Stepper />

        {step === "document-type" && (
          <div className="mt-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Document Type</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documentTypes.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDocumentType(doc.id)}
                    className={`p-6 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-lg ${
                      selectedDocumentType === doc.id
                        ? "border-blue-500 bg-blue-50 shadow-lg"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-4xl mb-4">{doc.icon}</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{doc.title}</h3>
                    <p className="text-sm text-gray-600">{doc.description}</p>
                  </button>
                ))}
              </div>
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => go("company-info")}
                  disabled={!selectedDocumentType}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
                >
                  Continue
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

         {step === "company-info" && (
           <div className="mt-6">
             <div className="bg-white rounded-xl border border-gray-200 p-6">
               <h2 className="text-2xl font-bold text-gray-900 mb-6">
                 {documentTypes.find(d => d.id === selectedDocumentType)?.title} Information
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {getDocumentForm()}
               </div>

               <div className="mt-8 flex justify-between">
                 <button
                   onClick={() => go("document-type")}
                   className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50"
                 >
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                   </svg>
                   Back
                 </button>
                 <button
                   onClick={() => go("generate")}
                   disabled={!companyInfo.companyName.trim()}
                   className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
                 >
                   Continue
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                   </svg>
                 </button>
               </div>
             </div>
           </div>
         )}

        {step === "generate" && (
          <div className="mt-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Review & Generate</h2>
              
              {/* Document Type Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Format</h3>
                <div className="flex gap-4">
                  <button
                    onClick={() => setSelectedFormat("docx")}
                    className={`px-6 py-3 rounded-lg border-2 transition-all ${
                      selectedFormat === "docx"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    📄 DOCX
                  </button>
                  <button
                    onClick={() => setSelectedFormat("pdf")}
                    className={`px-6 py-3 rounded-lg border-2 transition-all ${
                      selectedFormat === "pdf"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    📋 PDF
                  </button>
                </div>
              </div>

              {/* Review Information */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Document Type:</span>
                    <span className="ml-2 text-gray-900">{documentTypes.find(d => d.id === selectedDocumentType)?.title}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Company:</span>
                    <span className="ml-2 text-gray-900">{companyInfo.companyName}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Jurisdiction:</span>
                    <span className="ml-2 text-gray-900">{companyInfo.jurisdiction}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Structure:</span>
                    <span className="ml-2 text-gray-900">{companyInfo.capitalStructure}</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-medium text-gray-700">Founders:</span>
                    <span className="ml-2 text-gray-900">{companyInfo.founders}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => go("company-info")}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
                >
                  {generating ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating Document...
                    </>
                  ) : (
                    "Generate AI Legal Document"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === "review" && (
          <div className="mt-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Generated Document</h2>
                <button
                  onClick={handleDownload}
                  disabled={!generatedDocument}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download {selectedFormat.toUpperCase()}
                </button>
              </div>

              {generatedDocument ? (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {selectedFormat === "pdf" ? (
                    <iframe
                      src={generatedDocument}
                      className="w-full h-[600px]"
                      title="Generated Legal Document"
                    />
                  ) : (
                    <div className="p-8 text-center">
                      <div className="text-6xl mb-4">📄</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Document Generated Successfully</h3>
                      <p className="text-gray-600 mb-4">Your {documentTypes.find(d => d.id === selectedDocumentType)?.title} has been generated.</p>
                      <p className="text-sm text-gray-500">Click the download button above to save the document.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No document available</h3>
                  <p className="text-gray-600">Please generate a document to see it here.</p>
                </div>
              )}

              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => go("document-type")}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Generate New Document
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
