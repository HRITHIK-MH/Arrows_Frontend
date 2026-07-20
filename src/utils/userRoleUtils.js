export const normalizeRoleValue = (value = '') => {
  const text = String(value ?? '').trim().toLowerCase();
  if (!text) return '';
  return text.replace(/[\s_-]+/g, '');
};

export const normalizePersonaValue = (value = '') => {
  const text = String(value ?? '').trim().toLowerCase();
  if (!text) return '';

  const compact = text.replace(/[\s_-]+/g, '');
  if (text === 'business stakeholder' || compact === 'businessstakeholder' || compact === 'stakeholder') {
    return 'businessstakeholder';
  }

  return '';
};

export const isBusinessStakeholderValue = (value = '') => {
  return normalizePersonaValue(value) === 'businessstakeholder' || normalizeRoleValue(value) === 'businessstakeholder';
};
