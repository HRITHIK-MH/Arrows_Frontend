import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CANDIDATE_FORM_SCHEMA,
  getNestedValue,
  mapResumeToCandidateForm,
  setNestedValue,
} from './resumeFieldMapper.js';

test('maps a complete resume JSON into candidate form schema', () => {
  const result = mapResumeToCandidateForm({
    personal_information: {
      first_name: 'Asha',
      last_name: 'Rao',
      email: 'asha@example.com',
      phone: '9876543210',
      gender: 'Female',
      date_of_birth: '1995-01-01',
    },
    professional_information: {
      total_experience_years: 5,
      current_company: 'MethodHub',
      current_designation: 'React Developer',
      employment_type: 'full-time',
      notice_period_days: 30,
      current_ctc: 12,
      expected_ctc: 16,
    },
    skills: ['React', 'JavaScript', 'CSS'],
  });

  assert.equal(result.candidate_information.first_name, 'Asha');
  assert.equal(result.candidate_information.primary_email_address, 'asha@example.com');
  assert.equal(result.current_company_information.current_company_name, 'MethodHub');
  assert.equal(result.current_company_information.notice_period_days, 30);
  assert.equal(result.skills_information.primary_skill, 'React');
  assert.deepEqual(result.skills_information.secondary_skills, ['JavaScript', 'CSS']);
  assert.deepEqual(Object.keys(result), Object.keys(CANDIDATE_FORM_SCHEMA));
});

test('maps partial resume JSON and preserves schema defaults', () => {
  const result = mapResumeToCandidateForm({
    personal_information: {
      email: 'partial@example.com',
    },
  });

  assert.equal(result.candidate_information.first_name, '');
  assert.equal(result.candidate_information.primary_email_address, 'partial@example.com');
  assert.equal(result.current_company_information.candidate_type, 'Experienced');
  assert.equal(result.current_company_information.current_company_name, '');
  assert.deepEqual(result.skills_information.secondary_skills, []);
});

test('handles missing personal information', () => {
  const result = mapResumeToCandidateForm({
    professional_information: {
      current_company: 'Arrows',
    },
  });

  assert.equal(result.candidate_information.first_name, '');
  assert.equal(result.candidate_information.phone_number, '');
  assert.equal(result.current_company_information.current_company_name, 'Arrows');
});

test('uses explicit primary skill when parser identifies one', () => {
  const result = mapResumeToCandidateForm({
    skills_information: {
      primary_skill: 'Python',
    },
    skills: ['SQL', 'Python', 'Power BI', 'Azure'],
  });

  assert.equal(result.skills_information.primary_skill, 'Python');
  assert.deepEqual(result.skills_information.secondary_skills, ['SQL', 'Power BI', 'Azure']);
});

test('falls back to first skill when no explicit primary skill exists', () => {
  const result = mapResumeToCandidateForm({
    skills: [
      { skill_name: 'Python' },
      { skill_name: 'SQL' },
      { skill_name: 'Power BI' },
    ],
  });

  assert.equal(result.skills_information.primary_skill, 'Python');
  assert.deepEqual(result.skills_information.secondary_skills, ['SQL', 'Power BI']);
});

test('handles missing skills, empty arrays, and null values', () => {
  const noSkills = mapResumeToCandidateForm({});
  const emptySkills = mapResumeToCandidateForm({ skills: [] });
  const nullValues = mapResumeToCandidateForm({
    personal_information: {
      first_name: null,
    },
    professional_information: {
      notice_period_days: null,
    },
  });

  assert.equal(noSkills.skills_information.primary_skill, '');
  assert.deepEqual(noSkills.skills_information.secondary_skills, []);
  assert.equal(emptySkills.skills_information.primary_skill, '');
  assert.deepEqual(emptySkills.skills_information.secondary_skills, []);
  assert.equal(nullValues.candidate_information.first_name, '');
  assert.equal(nullValues.current_company_information.notice_period_days, '');
});

test('malformed resume JSON never throws and returns schema defaults', () => {
  const malformedValues = [null, undefined, '', 42, [], { personal_information: null }];

  malformedValues.forEach((value) => {
    assert.doesNotThrow(() => mapResumeToCandidateForm(value));
    const result = mapResumeToCandidateForm(value);
    assert.deepEqual(Object.keys(result), Object.keys(CANDIDATE_FORM_SCHEMA));
    assert.equal(result.candidate_information.first_name, '');
    assert.deepEqual(result.skills_information.secondary_skills, []);
  });
});

test('nested getter and setter are defensive', () => {
  const target = {};

  assert.equal(getNestedValue(null, 'a.b'), undefined);
  assert.equal(getNestedValue({ a: null }, 'a.b'), undefined);
  assert.doesNotThrow(() => setNestedValue(target, 'a.b.c', 'value'));
  assert.equal(target.a.b.c, 'value');
});
