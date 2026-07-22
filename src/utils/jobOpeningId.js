export const getDisplayJobOpeningId = (row = {}) => {
  const value = [row?.jobPositionId, row?.openingJobId, row?.jobId, row?.id]
    .map((entry) => String(entry ?? '').trim())
    .find(Boolean);

  return value || '';
};
