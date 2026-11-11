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

export function makeListLanguages({ catalogRepository }) {
  return async function listLanguages() {
    return catalogRepository.listLanguages();
  };
}
