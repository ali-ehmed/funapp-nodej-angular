// const paginatedResultsHelper = require('../../helpers/paginationResultsHelper');

const mockData = {
  organizations: [
    { id: 1, name: 'Organization A', created_at: '2024-01-01' },
    { id: 2, name: 'Organization B', created_at: '2024-01-02' },
    { id: 3, name: 'Organization C', created_at: '2024-01-03' },
  ],
  repositories: [
    { id: 1, name: 'Repo A', owner: 'Org A' },
    { id: 2, name: 'Repo B', owner: 'Org B' },
    { id: 3, name: 'Repo C', owner: 'Org C' },
  ],
};

// GET /api/:integration/data-viewer/:collection
exports.getData = async (req, res, next) => {
  try {
    const { collection } = req.params;
    const { search = '' } = req.query;
    const { page, perPage: pageSize } = req.pagination;

    // Check if the collection exists in mockData
    if (!mockData[collection]) {
      return res.status(404).json({ error: `Collection '${collection}' not found.` });
    }

    // Get the data for the collection
    const totalDataSize = mockData[collection].length;
    let data = mockData[collection];

    // Apply search filter
    if (search) {
      data = data.filter(item => 
        Object.values(item).some(value => 
          value.toString().toLowerCase().includes(search.toLowerCase())
        )
      );
    }

    // Pagination logic
    const startIndex = (page - 1) * pageSize;
    const paginatedData = data.slice(startIndex, startIndex + parseInt(pageSize));

    // Generate columns dynamically based on the collection data (mocked)
    const columns = data.length
      ? Object.keys(data[0]).map(field => ({ field, headerName: field.replace('_', ' ').toUpperCase() }))
      : [];

    // Set the paginated data in res.locals for the pagination middleware
    res.locals.paginatedData = {
      columns,
      rows: paginatedData,
    };
    res.locals.totalCount = totalDataSize;

    next();
  } catch (error) {
    console.error(`Error fetching ${collection} data:`, error);
    return res.status(500).json({ message: `Failed to fetch ${collection} data` });
  }
};
