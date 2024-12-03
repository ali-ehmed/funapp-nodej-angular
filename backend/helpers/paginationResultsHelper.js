exports.getPaginatedResults = async (model, filters, page, perPage, populate = null) => {
  const skip = (page - 1) * perPage;
  let query = model.find(filters).skip(skip).limit(perPage);

  // Apply populate if specified
  if (populate) {
    query = query.populate(populate);
  }

  return await query.exec();
};
