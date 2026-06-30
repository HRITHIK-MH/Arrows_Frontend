import assert from 'node:assert/strict';
import test from 'node:test';
import {
  applyResumeGuardrails,
  isValidCurrentCompany,
  isValidCurrentDesignation,
} from './resumeGuardrailValidator.js';

test('uses latest active employment as source of truth for current company and designation', () => {
  const result = applyResumeGuardrails({
    professional_information: {
      current_company: 'Implemented Business Process Flows for each procurement stage',
      current_designation: 'each procurement stage before progression to the next workflow',
    },
    employment_history: [
      {
        company: 'Previous Tech',
        designation: 'Software Engineer',
        start_date: 'Jan 2022',
        end_date: 'Mar 2024',
      },
      {
        company: 'Sahana System',
        designation: 'Associate Software Engineer - Power Platform',
        start_date: 'Apr 2024',
        end_date: 'Present',
      },
    ],
  });

  assert.equal(result.professional_information.current_company, 'Sahana System');
  assert.equal(
    result.professional_information.current_designation,
    'Associate Software Engineer - Power Platform'
  );
});

test('detects active employment from period text and null end date', () => {
  const result = applyResumeGuardrails({
    professional_information: {
      current_company: 'Wrong Company',
      current_designation: 'Wrong Role',
    },
    employment_history: [
      {
        company_name: 'Older Company',
        job_title: 'Developer',
        period: 'Jan 2021 - Dec 2023',
      },
      {
        company_name: 'MethodHub Software Ltd',
        job_title: 'React Developer',
        period: 'Apr 2024 - Present',
        end_date: null,
      },
    ],
  });

  assert.equal(result.professional_information.current_company, 'MethodHub Software Ltd');
  assert.equal(result.professional_information.current_designation, 'React Developer');
});

test('keeps GPT values when no active employment record is found', () => {
  const result = applyResumeGuardrails({
    professional_information: {
      current_company: 'Existing Company',
      current_designation: 'Existing Role',
    },
    employment_history: [
      {
        company: 'Past Company',
        designation: 'Past Role',
        start_date: 'Jan 2021',
        end_date: 'Dec 2023',
      },
    ],
  });

  assert.equal(result.professional_information.current_company, 'Existing Company');
  assert.equal(result.professional_information.current_designation, 'Existing Role');
});

test('clears current company and designation when employment history is empty', () => {
  const result = applyResumeGuardrails({
    professional_information: {
      current_company: 'Implemented Business Process Flows for procurement',
      current_designation: 'each procurement stage before progression to the next workflow',
    },
    employment_history: [],
  });

  assert.equal(result.professional_information.current_company, null);
  assert.equal(result.professional_information.current_designation, null);
});

test('clears invalid GPT values when employment history has no active record', () => {
  const result = applyResumeGuardrails({
    professional_information: {
      current_company: 'Implemented Business Process Flows for procurement',
      current_designation: 'each procurement stage before progression to the next workflow',
    },
    employment_history: [
      {
        company: 'Past Company',
        designation: 'Past Role',
        start_date: 'Jan 2021',
        end_date: 'Dec 2023',
      },
    ],
  });

  assert.equal(result.professional_information.current_company, null);
  assert.equal(result.professional_information.current_designation, null);
});

test('rejects responsibility-like company and designation values', () => {
  assert.equal(isValidCurrentCompany('Implemented Business Process Flows for procurement'), false);
  assert.equal(isValidCurrentCompany('each procurement stage before progression, improving'), false);
  assert.equal(isValidCurrentCompany('Sahana System'), true);
  assert.equal(
    isValidCurrentDesignation('each procurement stage before progression to the next workflow'),
    false
  );
  assert.equal(isValidCurrentDesignation('Associate Software Engineer - Power Platform'), true);
});

test('guardrail never throws for malformed resume JSON', () => {
  [null, undefined, '', 42, [], { employment_history: 'bad' }].forEach((value) => {
    assert.doesNotThrow(() => applyResumeGuardrails(value));
  });
});
