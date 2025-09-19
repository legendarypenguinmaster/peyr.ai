"use client";

import { CompanyInfo } from "@/app/ai-tools/legal-generator/LegalGeneratorClient";

interface IpAssignmentAgreementFormProps {
  companyInfo: CompanyInfo;
  updateCompanyInfo: (field: keyof CompanyInfo, value: string) => void;
}

export default function IpAssignmentAgreementForm({ companyInfo, updateCompanyInfo }: IpAssignmentAgreementFormProps) {
  return (
    <>
      {/* Common Company Fields */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
        <input
          type="text"
          value={companyInfo.companyName}
          onChange={(e) => updateCompanyInfo("companyName", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter company name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Company Address</label>
        <textarea
          value={companyInfo.companyAddress || ""}
          onChange={(e) => updateCompanyInfo("companyAddress", e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Full company address"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Jurisdiction</label>
        <select
          value={companyInfo.jurisdiction}
          onChange={(e) => updateCompanyInfo("jurisdiction", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="Delaware, USA">Delaware, USA</option>
          <option value="California, USA">California, USA</option>
          <option value="New York, USA">New York, USA</option>
          <option value="United Kingdom">United Kingdom</option>
          <option value="Canada">Canada</option>
          <option value="Singapore">Singapore</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Document Date</label>
        <input
          type="date"
          value={companyInfo.documentDate || ""}
          onChange={(e) => updateCompanyInfo("documentDate", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Effective Date</label>
        <input
          type="date"
          value={companyInfo.effectiveDate || ""}
          onChange={(e) => updateCompanyInfo("effectiveDate", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* IP Assignment Agreement Specific Fields */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">IP Owner *</label>
        <input
          type="text"
          value={companyInfo.ipOwner || ""}
          onChange={(e) => updateCompanyInfo("ipOwner", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Name of current IP owner"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">IP Assignee *</label>
        <input
          type="text"
          value={companyInfo.ipAssignee || ""}
          onChange={(e) => updateCompanyInfo("ipAssignee", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Name of IP assignee (company)"
          required
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">IP Description *</label>
        <textarea
          value={companyInfo.ipDescription || ""}
          onChange={(e) => updateCompanyInfo("ipDescription", e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Describe the intellectual property being assigned (e.g., software code, patents, trademarks, trade secrets)"
          required
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Scope *</label>
        <textarea
          value={companyInfo.assignmentScope || ""}
          onChange={(e) => updateCompanyInfo("assignmentScope", e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Define the scope of IP assignment (e.g., all IP created during employment, specific projects, future inventions)"
          required
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">Business Description</label>
        <textarea
          value={companyInfo.businessDescription}
          onChange={(e) => updateCompanyInfo("businessDescription", e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Describe your business, products, and services"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">Special Provisions</label>
        <textarea
          value={companyInfo.specialProvisions}
          onChange={(e) => updateCompanyInfo("specialProvisions", e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Any special terms, clauses, or provisions..."
        />
      </div>
    </>
  );
}
