export const calculatePagination = ({
  page,
  limit,
  totalCount,
}: {
  page: number;
  limit: number;
  totalCount: number;
}) => {
  const totalPages = Math.ceil(totalCount / limit);
  return {
    currentPage: page,
    limit,
    totalPages,
    totalCount,
    hasNext: page < totalPages,
    hasPrevious: page > 1,
  };
};
