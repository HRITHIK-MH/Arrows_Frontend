import assert from 'node:assert/strict';
import test from 'node:test';
import { applyJdGuardrails } from './jdGuardrailValidator.js';

test('normalizes JD dropdown values and numeric fields', () => {
  const result = applyJdGuardrails({
    job_information: {
      job_name: 'Android Developer',
      position_level: 'sr developer',
      work_type: 'work from home',
      employment_type: 'permanent full-time',
      number_of_positions: '5 openings',
      location: ['Bangalore', 'Bangalore', 'Remote'],
    },
    experience_requirements: {
      minimum_experience: '8 years',
      maximum_experience: '3 years',
    },
    compensation: {
      minimum_ctc: '12 LPA',
      maximum_ctc: '18,00,000',
    },
    skills: {
      technical_skills: ['React', 'React', 'JavaScript'],
    },
  });

  assert.equal(result.job_information.position_level, 'Senior');
  assert.equal(result.job_information.work_type, 'Remote');
  assert.equal(result.job_information.employment_type, 'Full Time Employment');
  assert.equal(result.job_information.number_of_positions, 5);
  assert.deepEqual(result.job_information.location, ['Bangalore', 'Remote']);
  assert.equal(result.experience_requirements.minimum_experience, 3);
  assert.equal(result.experience_requirements.maximum_experience, 8);
  assert.equal(result.compensation.minimum_ctc, '12');
  assert.equal(result.compensation.maximum_ctc, '1800000');
  assert.deepEqual(result.skills.technical_skills, ['React', 'JavaScript']);
});

test('rejects responsibility-like job names and noisy skills', () => {
  const result = applyJdGuardrails({
    job_information: {
      job_name: 'Responsible for designing and implementing scalable dashboards for stakeholders.',
      number_of_positions: 1200,
    },
    skills: {
      technical_skills: [
        'Java',
        'Responsible for designing enterprise grade workflows for business users',
      ],
    },
  });

  assert.equal(result.job_information.job_name, '');
  assert.equal(result.job_information.number_of_positions, 999);
  assert.deepEqual(result.skills.technical_skills, ['Java']);
});

test('returns a complete guarded JD shape for malformed input', () => {
  const result = applyJdGuardrails(null);

  assert.deepEqual(Object.keys(result), [
    'job_information',
    'experience_requirements',
    'compensation',
    'skills',
    'job_description',
  ]);
  assert.equal(result.job_information.job_name, '');
  assert.deepEqual(result.skills.technical_skills, []);
});
