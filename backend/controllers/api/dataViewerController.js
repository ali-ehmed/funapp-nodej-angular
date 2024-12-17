const dataViewer = require('../../lib/dataViewer/dataViewer');

exports.getData = async (req, res, next) => {
  const { collection } = req.params;
  const { search = '', filters = '{}', sort: sortAttr, sortOrder = 'asc' } = req.query;
  const { page, perPage } = req.pagination;

  try {
    // Fetch data using dataViewer
    const { columns, rows, totalRecords } = await dataViewer(
      collection,
      {
        search,
        filters,
        sort: sortAttr,
        sortOrder,
        page,
        perPage
      }
    );

    res.locals.paginatedData = { columns, rows };
    res.locals.totalCount = totalRecords;

    next();
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: error.message });
  }
};
