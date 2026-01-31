import React, { useMemo } from "react";

const formatBytes = (bytes) => {
  if (!bytes && bytes !== 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

const CandidateDocumentsStep = ({ formData, onChange, onSetStepFields }) => {
  const documents = Array.isArray(formData.candidateDocuments)
    ? formData.candidateDocuments
    : [];

  React.useEffect(() => {
    if (onSetStepFields) {
      onSetStepFields([
        { name: "candidateDocuments", label: "Candidate Documents", required: false },
      ]);
    }
  }, [onSetStepFields]);

  const addFiles = (fileList) => {
    const files = Array.from(fileList || []).map((file) => ({
      id: `${file.name}-${file.lastModified}-${file.size}`,
      name: file.name,
      size: file.size,
      type: file.type,
      file,
    }));
    if (files.length === 0) return;
    const nextDocs = [...documents, ...files];
    onChange("candidateDocuments", nextDocs);
    if (!formData.candidateResume) {
      onChange("candidateResume", files[0]);
    }
  };

  const handleFileChange = (event) => {
    addFiles(event.target.files);
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    addFiles(event.dataTransfer.files);
  };

  const handleRemove = (docId) => {
    const nextDocs = documents.filter((doc) => doc.id !== docId);
    onChange("candidateDocuments", nextDocs);
    if (nextDocs.length === 0) {
      onChange("candidateResume", "");
      return;
    }
    if (formData.candidateResume) {
      const resumeId =
        formData.candidateResume?.name &&
        formData.candidateResume?.size !== undefined
          ? `${formData.candidateResume.name}-${formData.candidateResume.lastModified}-${formData.candidateResume.size}`
          : null;
      if (resumeId && !nextDocs.some((doc) => doc.id === resumeId)) {
        onChange("candidateResume", nextDocs[0].file || nextDocs[0]);
      }
    }
  };

  const inputId = useMemo(() => "candidate-documents-input", []);

  return (
    <div className="candidate-documents-step">
      <div className="document-upload-header">Upload Document</div>
      <label
        htmlFor={inputId}
        className="document-dropzone"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="document-dropzone-icon">📄</div>
        <div className="document-dropzone-text">
          <span className="dropzone-link">Click Here</span> to upload your Documents or drag.
        </div>
        <div className="document-dropzone-subtext">Supported Format: PDF (20 mb)</div>
        <input
          id={inputId}
          type="file"
          accept=".pdf,.doc,.docx"
          multiple
          className="document-input"
          onChange={handleFileChange}
        />
      </label>

      <div className="document-list">
        {documents.length === 0 && (
          <div className="document-empty">No documents uploaded yet.</div>
        )}
        {documents.map((doc, index) => (
          <div
            key={doc.id}
            className={`document-item ${index % 2 === 0 ? "document-item--blue" : "document-item--peach"}`}
          >
            <div className="document-info">
              <div className="document-icon">📄</div>
              <div>
                <div className="document-name">{doc.name}</div>
                <div className="document-meta">
                  {doc.type ? doc.type.replace("application/", "") : "file"} |{" "}
                  {formatBytes(doc.size)}
                </div>
              </div>
            </div>
            <button
              type="button"
              className="document-delete"
              aria-label={`Remove ${doc.name}`}
              onClick={() => handleRemove(doc.id)}
            >
              🗑
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CandidateDocumentsStep;
