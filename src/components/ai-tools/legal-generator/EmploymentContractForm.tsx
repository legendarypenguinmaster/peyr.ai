"use client";

import { CompanyInfo } from "@/app/ai-tools/legal-generator/LegalGeneratorClient";

interface EmploymentContractFormProps {
  companyInfo: CompanyInfo;
  updateCompanyInfo: (field: keyof CompanyInfo, value: string) => void;
}

export default function EmploymentContractForm({ companyInfo, updateCompanyInfo }: EmploymentContractFormProps) {
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

      {/* Employment Contract Specific Fields */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Employee Name *</label>
        <input
          type="text"
          value={companyInfo.employeeName || ""}
          onChange={(e) => updateCompanyInfo("employeeName", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Full name of employee"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Employee Role *</label>
        <input
          type="text"
          value={companyInfo.employeeRole || ""}
          onChange={(e) => updateCompanyInfo("employeeRole", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., Software Engineer, Marketing Manager"
          required
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">Employee Address</label>
        <textarea
          value={companyInfo.employeeAddress || ""}
          onChange={(e) => updateCompanyInfo("employeeAddress", e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Employee's full address"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Salary *</label>
        <input
          type="text"
          value={companyInfo.salary || ""}
          onChange={(e) => updateCompanyInfo("salary", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., $80,000 annually"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Benefits</label>
        <input
          type="text"
          value={companyInfo.benefits || ""}
          onChange={(e) => updateCompanyInfo("benefits", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., Health insurance, 401k, PTO"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
        <input
          type="date"
          value={companyInfo.startDate || ""}
          onChange={(e) => updateCompanyInfo("startDate", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
