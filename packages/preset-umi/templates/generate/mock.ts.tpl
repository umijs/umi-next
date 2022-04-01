export default {
  // you can mock api simply return a json
  'GET /api/{{{mockName}}}-json': {
    success: true,
    data: {
      users: [{ name: 'admin' }, { name: 'test' }],
    },
  },
  // you can also use a express  middleware to mock the api
  'GET /api/{{{mockName}}}-middleware': (_req: any, res: any) => {
    res.json({
      success: false,
      data: {},
      errorMessage: 'Error!',
      showType: 1,
      errorCode: -1,
    });
  },
};
