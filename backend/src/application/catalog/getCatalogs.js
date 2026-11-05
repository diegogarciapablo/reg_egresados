export function makeListTechnologies({ catalogRepository }) {
  return async function listTechnologies() {
    return catalogRepository.listTechnologies();
  };
}

export function makeListSoftSkills({ catalogRepository }) {
  return async function listSoftSkills() {
    return catalogRepository.listSoftSkills();
  };
}
