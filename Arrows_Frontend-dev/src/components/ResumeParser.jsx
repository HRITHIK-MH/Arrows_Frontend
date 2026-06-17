import React, { useState } from 'react';
import { parseResume } from '../api/resumeParserService';
import styles from './ResumeParser.module.scss';

function ResumeParser() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    setError('');
    setFile(selectedFile);
  };

  const handleParseResume = async () => {
    if (!file) {
      setError('Please select a resume.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setResult(null);

      const parsed = await parseResume(file);
      setResult(parsed);
    } catch (err) {
      setError(err?.message || 'Failed to parse resume.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>ARROWS Resume Parser</h1>

      <div className={styles.inputSection}>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileChange}
          className={styles.fileInput}
        />
        {file && <p className={styles.fileName}>Selected: {file.name}</p>}
      </div>

      <button
        type="button"
        onClick={handleParseResume}
        disabled={loading}
        className={styles.parseButton}
      >
        {loading ? 'Processing...' : 'Parse Resume'}
      </button>

      {error && <div className={styles.error}>{error}</div>}

      {result && (
        <>
          <hr className={styles.divider} />
          <div className={styles.resultsSection}>
            <h2>Resume JSON</h2>
            <pre className={styles.jsonOutput}>{JSON.stringify(result.resumeJson, null, 2)}</pre>
          </div>
          <div className={styles.resultsSection}>
            <h2>Candidate Form</h2>
            <pre className={styles.jsonOutput}>{JSON.stringify(result.candidateForm, null, 2)}</pre>
          </div>
        </>
      )}
    </div>
  );
}

export default ResumeParser;
