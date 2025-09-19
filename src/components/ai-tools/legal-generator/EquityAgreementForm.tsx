"use client";

import { CompanyInfo } from "@/app/ai-tools/legal-generator/LegalGeneratorClient";

interface EquityAgreementFormProps {
  companyInfo: CompanyInfo;
  updateCompanyInfo: (field: keyof CompanyInfo, value: string) => void;
}

export default function EquityAgreementForm({ companyInfo, updateCompanyInfo }: EquityAgreementFormProps) {
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

      {/* Equity Agreement Specific Fields */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Employee Name *</label>
        <input
          type="text"
          value={companyInfo.employeeName || ""}
          onChange={(e) => updateCompanyInfo("employeeName", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Full name of employee receiving equity"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Stock Options *</label>
        <input
          type="text"
          value={companyInfo.stockOptions || ""}
          onChange={(e) => updateCompanyInfo("stockOptions", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., 10,000 shares"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Exercise Price *</label>
        <input
          type="text"
          value={companyInfo.exercisePrice || ""}
          onChange={(e) => updateCompanyInfo("exercisePrice", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., $0.10 per share"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Grant Date *</label>
        <input
          type="date"
          value={companyInfo.startDate || ""}
          onChange={(e) => updateCompanyInfo("startDate", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Vesting Schedule</label>
        <select
          value={companyInfo.vestingSchedule}
          onChange={(e) => updateCompanyInfo("vestingSchedule", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="4 years, 1 year cliff">4 years, 1 year cliff</option>
          <option value="3 years, 6 months cliff">3 years, 6 months cliff</option>
          <option value="Immediate vesting">Immediate vesting</option>
          <option value="Custom schedule">Custom schedule</option>
        </select>
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
