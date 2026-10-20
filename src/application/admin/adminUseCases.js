export function makeListAllGraduates({ graduateRepository }) {
  return async function listAllGraduates({ page, limit }) {
    return graduateRepository.searchDirectory({ page, limit, visibility: undefined, includeInactive: true });
  };
}

export function makeUpdateGraduateStatus({ graduateRepository }) {
  return async function updateGraduateStatus({ graduateId, visibility }) {
    return graduateRepository.update(graduateId, { visibility });
  };
}
