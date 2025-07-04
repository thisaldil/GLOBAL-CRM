// src/components/EmailTemplatePreview.jsx
import React from "react";

const EmailTemplatePreview = ({ template, onBack }) => {
  if (!template) {
    return (
      <div className="p-6 text-center text-gray-500">
        No template selected for preview.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Preview</h2>
        <button
          onClick={onBack}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to Templates
        </button>
      </div>

      <div className="border-b pb-4 mb-4">
        <h3 className="text-xl font-bold text-gray-900">{template.subject}</h3>
        <p className="text-gray-600 text-sm">Category: {template.category}</p>
      </div>

      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: template.body }}
      />
    </div>
  );
};

export default EmailTemplatePreview;
