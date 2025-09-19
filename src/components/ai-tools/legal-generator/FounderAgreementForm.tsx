"use client";

import { CompanyInfo } from "@/app/ai-tools/legal-generator/LegalGeneratorClient";

interface FounderAgreementFormProps {
  companyInfo: CompanyInfo;
  updateCompanyInfo: (field: keyof CompanyInfo, value: string) => void;
}

export default function FounderAgreementForm({ companyInfo, updateCompanyInfo }: FounderAgreementFormProps) {
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
        <label className="block text-sm font-medium text-gray-700 mb-2">Capital Structure</label>
        <select
          value={companyInfo.capitalStructure}
          onChange={(e) => updateCompanyInfo("capitalStructure", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="LLC">LLC</option>
          <option value="C-Corporation">C-Corporation</option>
          <option value="S-Corporation">S-Corporation</option>
          <option value="Partnership">Partnership</option>
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

      {/* Founder Agreement Specific Fields */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">Founders (comma-separated) *</label>
        <input
          type="text"
          value={companyInfo.founders}
          onChange={(e) => updateCompanyInfo("founders", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="John Doe, Jane Smith"
          required
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">Equity Distribution *</label>
        <textarea
          value={companyInfo.equityDistribution || ""}
          onChange={(e) => updateCompanyInfo("equityDistribution", e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Describe how equity will be distributed among founders (e.g., 40% CEO, 30% CTO, 30% CMO)"
          required
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">Roles and Responsibilities *</label>
        <textarea
          value={companyInfo.rolesAndResponsibilities || ""}
          onChange={(e) => updateCompanyInfo("rolesAndResponsibilities", e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Define each founder's role, responsibilities, and decision-making authority"
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
