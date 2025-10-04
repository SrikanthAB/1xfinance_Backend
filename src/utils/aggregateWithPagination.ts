import mongoose from 'mongoose';

async function aggregateWithPagination({
  model,
  pipeline,
  page = 1,
  limit = 10,
}: {
  model: mongoose.Model<any>;
  pipeline: any[];
  page?: number;
  limit?: number;
}): Promise<{ list: any[]; totalCount: number }> {
  const skip = (page - 1) * limit;

  // Clone and modify the pipeline for pagination
  const paginatedPipeline = [
    ...pipeline,
    {
      $facet: {
        list: [
          { $skip: skip },
          { $limit: limit },
        ],
        totalCount: [
          { $count: 'count' },
        ],
      },
    },
    {
      $project: {
        list: 1,
        totalCount: { $arrayElemAt: ['$totalCount.count', 0] },
      },
    },
  ];

  const [result] = await model.aggregate(paginatedPipeline).exec();

  return {
    list: result?.list || [],
    totalCount: result?.totalCount || 0,
  };
}

export default aggregateWithPagination;
