import mongoose from 'mongoose';

async function findAllEntities({
  page = 1,
  limit = 10,
  filters = {},
  model,
  select,
  populate,
}: {
  page: number;
  limit: number;
  filters?: Record<string, any>;
  model: mongoose.Model<any>;
  select?: string;
  populate?: { path: string; select?: string }[];
}): Promise<{ entities: any[]; totalCount: number }> {
  const query: Record<string, any> = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (typeof value === "string") {
      query[key] = { $regex: value, $options: "i" };
    } else {
      query[key] = value;
    }
  });

  const findQuery = model.find(query).sort({ createdAt: -1 }).lean();
  if (select) {
    findQuery.select(select);
  }
  if (populate) {
    populate.map((item: any) => {
      findQuery.populate(item);
    });
  }

  const skip = (page - 1) * limit;
  const [entities, totalCount] = await Promise.all([
    findQuery.skip(skip).limit(limit),
    model.countDocuments(query),
  ]);

  return { entities, totalCount };
}

export default findAllEntities;