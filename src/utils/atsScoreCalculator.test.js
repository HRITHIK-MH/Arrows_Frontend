import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateAtsScore } from './atsScoreCalculator.js';

test('calculates high score when resume skills, title, and experience match the JD', () => {
  const result = calculateAtsScore({
    job: {
      postingTitle: 'React Developer',
      minExperience: 3,
      maxExperience: 5,
      technicalSkills: ['React', 'JavaScript', 'CSS'],
    },
    resume: {
      currentDesignation: 'Senior React Developer',
      totalExperience: 4,
      skills: 'React; JavaScript; CSS; HTML',
    },
  });

  assert.equal(result.score, 100);
  assert.deepEqual(result.breakdown.matchedSkills, ['react', 'javascript', 'css']);
  assert.equal(result.breakdown.experience, 100);
});

test('returns lower score when required skills are missing', () => {
  const result = calculateAtsScore({
    job: {
      postingTitle: 'Python Developer',
      minExperience: 2,
      maxExperience: 4,
      technicalSkills: ['Python', 'Django', 'PostgreSQL'],
    },
    resume: {
      currentDesignation: 'Frontend Developer',
      totalExperience: 3,
      skills: 'React; JavaScript',
    },
  });

  assert.equal(result.breakdown.skills, 0);
  assert.deepEqual(result.breakdown.missingSkills, ['python', 'django', 'postgresql']);
  assert.ok(result.score < 50);
});

test('reads skills and experience from parsed resume JSON shape', () => {
  const result = calculateAtsScore({
    job: {
      postingTitle: 'Power Platform Developer',
      minExperience: '3',
      maxExperience: '6',
      technicalSkills: [{ label: 'Power Apps' }, { label: 'Dataverse' }],
    },
    resume: {
      resumeJson: {
        professional_information: {
          current_designation: 'Associate Software Engineer - Power Platform',
          total_experience_years: 3.5,
        },
        skills: ['Power Apps', 'Dataverse', 'SharePoint'],
      },
    },
  });

  assert.equal(result.breakdown.skills, 100);
  assert.equal(result.breakdown.candidateExperience, 3.5);
  assert.ok(result.score >= 90);
});

test('handles missing or malformed inputs without throwing', () => {
  [null, undefined, {}, { job: null, resume: null }].forEach((value) => {
    assert.doesNotThrow(() => calculateAtsScore(value));
  });

  const result = calculateAtsScore();
  assert.equal(typeof result.score, 'number');
  assert.ok(result.score >= 0);
  assert.ok(result.score <= 100);
});
