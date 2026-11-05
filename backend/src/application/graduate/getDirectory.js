export function makeGetDirectory({ graduateRepository }) {
  return async function getDirectory({ q, technology, year, yearFrom, yearTo, page, limit }) {
    return graduateRepository.searchDirectory({
      q,
      technology,
      graduationYear: year,
      yearFrom,
      yearTo,
      page,
      limit,
      visibility: "public",
    });
  };
}
