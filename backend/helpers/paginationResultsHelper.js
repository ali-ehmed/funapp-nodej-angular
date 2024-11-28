exports.getPaginatedResults = async (model, filters, page, perPage) => {
  const skip = (page - 1) * perPage;
  return await model.find(filters).skip(skip).limit(perPage);
};
