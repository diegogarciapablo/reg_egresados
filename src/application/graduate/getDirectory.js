export function makeGetDirectory({ graduateRepository }) {
  return async function getDirectory({ q, technology, year, page, limit }) {
    return graduateRepository.searchDirectory({
      q,
      technology,
      graduationYear: year,
      page,
      limit,
      visibility: "public",
    });
  };
}
