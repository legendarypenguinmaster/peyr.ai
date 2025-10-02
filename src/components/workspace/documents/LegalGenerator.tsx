"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import FounderAgreementForm from "@/components/ai-tools/legal-generator/FounderAgreementForm";
import NonDisclosureAgreementForm from "@/components/ai-tools/legal-generator/NonDisclosureAgreementForm";
import EmploymentContractForm from "@/components/ai-tools/legal-generator/EmploymentContractForm";
import EquityAgreementForm from "@/components/ai-tools/legal-generator/EquityAgreementForm";
import AdvisorAgreementForm from "@/components/ai-tools/legal-generator/AdvisorAgreementForm";
import IpAssignmentAgreementForm from "@/components/ai-tools/legal-generator/IpAssignmentAgreementForm";

// CompanyInfo interface for legal generator
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

export type LegalStep = "document-type" | "company-info" | "generate" | "review" | "save";

interface LegalGeneratorProps {
  workspaceId: string;
  projects: Array<{ id: string; name: string }>;
  onSuccess: () => void;
}

export default function LegalGenerator({ workspaceId, projects, onSuccess }: LegalGeneratorProps) {
  const [legalStep, setLegalStep] = useState<LegalStep>("document-type");
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
  
  // Save step state
  const [saveForm, setSaveForm] = useState({
    title: '',
    description: '',
    type: 'document',
    project_id: '',
  });
  const [saving, setSaving] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const updateCompanyInfo = (field: keyof CompanyInfo, value: string) => {
    setCompanyInfo(prev => ({ ...prev, [field]: value }));
  };

  const goToStep = (step: LegalStep) => {
    setLegalStep(step);
    
    // Initialize save form when going to save step
    if (step === "save" && !saveForm.title) {
      const docType = documentTypes.find(d => d.id === selectedDocumentType);
      setSaveForm(prev => ({
        ...prev,
        title: docType ? docType.title : 'Generated Document',
        type: 'ai' // Default to AI generated type
      }));
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
      goToStep("review");
    } catch (error) {
      console.error("Document generation failed:", error);
      setError("Failed to generate document. Please try again.");
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

  const generateAIDescription = async () => {
    if (!generatedDocument) {
      setError('No document available to analyze');
      return;
    }

    try {
      setGeneratingDescription(true);
      setError(null);

      // Convert blob URL to file for analysis
      const response = await fetch(generatedDocument);
      const blob = await response.blob();
      const file = new File([blob], `${saveForm.title}.${selectedFormat}`, {
        type: selectedFormat === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });

      const formData = new FormData();
      formData.append('file', file);

      const aiResponse = await fetch('/api/ai-tools/documents/summarize', {
        method: 'POST',
        body: formData,
      });

      if (!aiResponse.ok) {
        const errorData = await aiResponse.json();
        throw new Error(errorData.error || 'Failed to generate description');
      }

      const aiData = await aiResponse.json();
      setSaveForm(prev => ({ ...prev, description: aiData.summary || '' }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate description');
    } finally {
      setGeneratingDescription(false);
    }
  };

  const handleSaveDocument = async () => {
    if (!saveForm.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!generatedDocument) {
      setError('No document to save');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Convert blob URL to file
      const response = await fetch(generatedDocument);
      const blob = await response.blob();
      const file = new File([blob], `${saveForm.title}.${selectedFormat}`, {
        type: selectedFormat === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });

      const formData = new FormData();
      formData.append('title', saveForm.title);
      formData.append('description', saveForm.description);
      formData.append('type', saveForm.type);
      if (saveForm.project_id) {
        formData.append('project_id', saveForm.project_id);
      }
      formData.append('file', file);

      const saveResponse = await fetch(`/api/workspaces/${workspaceId}/documents`, {
        method: 'POST',
        body: formData,
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.error || 'Failed to save document');
      }

      // Success - close modal and refresh documents
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save document');
    } finally {
      setSaving(false);
    }
  };

  // Form components for each document type
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

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div className="flex items-center gap-3 text-sm border-b border-gray-200 dark:border-gray-700 pb-4">
        {([
          { key: "document-type", label: "Document Type" },
          { key: "company-info", label: "Company Info" },
          { key: "generate", label: "Generate" },
          { key: "review", label: "Review" },
          { key: "save", label: "Save" },
        ] as { key: LegalStep; label: string }[]).map((s, idx, arr) => (
          <div key={s.key} className="flex items-center gap-3">
            <button 
              onClick={() => goToStep(s.key)} 
              className={`h-7 w-7 rounded-full text-xs font-semibold flex items-center justify-center ${
                legalStep === s.key 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
              }`}
            >
              {idx + 1}
            </button>
            <span className={`text-sm ${
              legalStep === s.key 
                ? "text-gray-900 dark:text-white" 
                : "text-gray-500 dark:text-gray-400"
            }`}>
              {s.label}
            </span>
            {idx < arr.length - 1 && <div className="h-px w-10 bg-gray-200 dark:bg-gray-600" />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {legalStep === "document-type" && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Document Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documentTypes.map((doc) => (
              <button
                key={doc.id}
                onClick={() => {
                  setSelectedDocumentType(doc.id);
                  goToStep("company-info");
                }}
                className="p-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700 text-left transition-all duration-200 hover:shadow-lg"
              >
                <div className="text-3xl mb-3">{doc.icon}</div>
                <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2">{doc.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{doc.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {legalStep === "company-info" && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {documentTypes.find(d => d.id === selectedDocumentType)?.title} Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getDocumentForm()}
          </div>
          <div className="mt-6 flex justify-between">
            <button
              onClick={() => goToStep("document-type")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <button
              onClick={() => goToStep("generate")}
              disabled={!companyInfo.companyName.trim()}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {legalStep === "generate" && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Review & Generate</h3>
          
          {/* Document Format Selection */}
          <div className="mb-6">
            <h4 className="text-base font-medium text-gray-900 dark:text-white mb-3">Document Format</h4>
            <div className="flex gap-4">
              <button
                onClick={() => setSelectedFormat("docx")}
                disabled
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  selectedFormat === "docx"
                    ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                📄 DOCX
              </button>
              <button
                onClick={() => setSelectedFormat("pdf")}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  selectedFormat === "pdf"
                    ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                📋 PDF
              </button>
            </div>
          </div>

          {/* Review Information */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
            <h4 className="text-base font-medium text-gray-900 dark:text-white mb-3">Review Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Document Type:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{documentTypes.find(d => d.id === selectedDocumentType)?.title}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Company:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{companyInfo.companyName}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Jurisdiction:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{companyInfo.jurisdiction}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Structure:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{companyInfo.capitalStructure}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => goToStep("company-info")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                "Generate AI Legal Document"
              )}
            </button>
          </div>
        </div>
      )}

      {legalStep === "review" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Generated Document</h3>
            <div className="flex gap-2">
              <button
                onClick={() => goToStep("save")}
                disabled={!generatedDocument}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save to Workspace
              </button>
              <button
                onClick={handleDownload}
                disabled={!generatedDocument}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download {selectedFormat.toUpperCase()}
              </button>
            </div>
          </div>

          {generatedDocument ? (
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
              {selectedFormat === "pdf" ? (
                <iframe
                  src={generatedDocument}
                  className="w-full h-[400px]"
                  title="Generated Legal Document"
                />
              ) : (
                <div className="p-6 text-center">
                  <div className="text-4xl mb-3">📄</div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Document Generated Successfully</h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">Your {documentTypes.find(d => d.id === selectedDocumentType)?.title} has been generated.</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Click the download button above to save the document.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📋</div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No document available</h4>
              <p className="text-gray-600 dark:text-gray-400">Please generate a document to see it here.</p>
            </div>
          )}

          <div className="mt-4 flex justify-center">
            <button
              onClick={() => goToStep("document-type")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Generate New Document
            </button>
          </div>
        </div>
      )}

      {legalStep === "save" && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Save Document to Workspace</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={saveForm.title}
                onChange={(e) => setSaveForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Enter document title"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <button
                  type="button"
                  onClick={generateAIDescription}
                  disabled={generatingDescription || !generatedDocument}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {generatingDescription ? (
                    <>
                      <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      AI Summarize
                    </>
                  )}
                </button>
              </div>
              <textarea
                value={saveForm.description}
                onChange={(e) => setSaveForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Enter document description or click AI Summarize to generate one"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <select
                value={saveForm.type}
                onChange={(e) => setSaveForm(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="document">Document</option>
                <option value="contract">Contract</option>
                <option value="legal">Legal</option>
                <option value="proposal">Proposal</option>
                <option value="note">Note</option>
                <option value="ai">AI Generated</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project (Optional)
              </label>
              <select
                value={saveForm.project_id}
                onChange={(e) => setSaveForm(prev => ({ ...prev, project_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">No project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => goToStep("review")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <button
              onClick={handleSaveDocument}
              disabled={saving || !saveForm.title.trim()}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Save Document
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
