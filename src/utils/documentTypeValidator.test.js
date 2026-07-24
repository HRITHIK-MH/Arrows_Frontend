import test from 'node:test';
import assert from 'node:assert/strict';
import { isJobDescriptionDocument, isResumeDocument } from './documentTypeValidator.js';

const resumeText = `
Anjali Sharma
anjali.sharma@example.com
+91 9876543210

Professional Summary
Full stack developer with 8 years of experience.

Technical Skills
React, Node.js, AWS

Work Experience
Client: CSX
Role: Senior .NET Full Stack Developer
Jan 2024 - Still

Education
B.Tech Computer Science
`;

const jdText = `
Job Description
Job Title: Senior React Developer
Location: Bengaluru
Employment Type: Full Time
Number of Openings: 2

Key Responsibilities
- Build scalable frontend applications.

Requirements
- 5+ years of React experience.
- Strong JavaScript and API integration skills.

Qualifications
Bachelor's degree preferred.
`;

test('detects resume documents and rejects them as JD documents', () => {
  assert.equal(isResumeDocument(resumeText), true);
  assert.equal(isJobDescriptionDocument(resumeText), false);
});

test('detects JD documents and rejects them as resume documents', () => {
  assert.equal(isJobDescriptionDocument(jdText), true);
  assert.equal(isResumeDocument(jdText), false);
});

test('rejects unrelated documents for both resume and JD upload flows', () => {
  const unrelated = 'Invoice Number INV-001 Amount Due Payment Terms Bank Details';
  assert.equal(isResumeDocument(unrelated), false);
  assert.equal(isJobDescriptionDocument(unrelated), false);
});

test('accepts field-based JD documents without explicit section titles', () => {
  const fieldBasedJd = `
Position Name: Java Developer
Location: Chennai
Employment Type: Full Time
Work Type: Hybrid
Minimum Experience: 3 years
Maximum Experience: 6 years
Compensation: 12 LPA
`;

  assert.equal(isJobDescriptionDocument(fieldBasedJd), true);
  assert.equal(isResumeDocument(fieldBasedJd), false);
});
