export const chromeMock = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
    },
    sync: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
    },
  },
  action: {
    setIcon: jest.fn(),
  },
  runtime: {
    lastError: {},
  },
};
