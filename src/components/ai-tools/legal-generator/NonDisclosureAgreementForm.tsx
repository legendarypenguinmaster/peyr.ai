"use client";

import { CompanyInfo } from "@/app/ai-tools/legal-generator/LegalGeneratorClient";

interface NonDisclosureAgreementFormProps {
  companyInfo: CompanyInfo;
  updateCompanyInfo: (field: keyof CompanyInfo, value: string) => void;
}

export default function NonDisclosureAgreementForm({ companyInfo, updateCompanyInfo }: NonDisclosureAgreementFormProps) {
  return (
    <>
      {/* Common Company Fields */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company Name *</label>
        <input
          type="text"
          value={companyInfo.companyName}
          onChange={(e) => updateCompanyInfo("companyName", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          placeholder="Enter company name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company Address</label>
        <textarea
          value={companyInfo.companyAddress || ""}
          onChange={(e) => updateCompanyInfo("companyAddress", e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          placeholder="Full company address"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Jurisdiction</label>
        <select
          value={companyInfo.jurisdiction}
          onChange={(e) => updateCompanyInfo("jurisdiction", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
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
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Document Date</label>
        <input
          type="date"
          value={companyInfo.documentDate || ""}
          onChange={(e) => updateCompanyInfo("documentDate", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Effective Date</label>
        <input
          type="date"
          value={companyInfo.effectiveDate || ""}
          onChange={(e) => updateCompanyInfo("effectiveDate", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      {/* NDA Specific Fields */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Disclosing Party *</label>
        <input
          type="text"
          value={companyInfo.disclosingParty || ""}
          onChange={(e) => updateCompanyInfo("disclosingParty", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          placeholder="Company or individual disclosing information"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Receiving Party *</label>
        <input
          type="text"
          value={companyInfo.receivingParty || ""}
          onChange={(e) => updateCompanyInfo("receivingParty", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          placeholder="Company or individual receiving information"
          required
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confidential Information *</label>
        <textarea
          value={companyInfo.confidentialInformation || ""}
          onChange={(e) => updateCompanyInfo("confidentialInformation", e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          placeholder="Describe what information is considered confidential (e.g., business plans, customer lists, technical specifications)"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Disclosure Period</label>
        <select
          value={companyInfo.disclosurePeriod || "2 years"}
          onChange={(e) => updateCompanyInfo("disclosurePeriod", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        >
          <option value="1 year">1 year</option>
          <option value="2 years">2 years</option>
          <option value="3 years">3 years</option>
          <option value="5 years">5 years</option>
          <option value="Indefinite">Indefinite</option>
        </select>
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Business Description</label>
        <textarea
          value={companyInfo.businessDescription}
          onChange={(e) => updateCompanyInfo("businessDescription", e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          placeholder="Describe your business, products, and services"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Special Provisions</label>
        <textarea
          value={companyInfo.specialProvisions}
          onChange={(e) => updateCompanyInfo("specialProvisions", e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          placeholder="Any special terms, clauses, or provisions..."
        />
      </div>
    </>
  );
}
