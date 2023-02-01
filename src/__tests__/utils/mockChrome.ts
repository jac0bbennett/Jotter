import { vi } from "vitest";

export const chromeMock = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
    },
    sync: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
    },
  },
  action: {
    setIcon: vi.fn(),
  },
  runtime: {
    lastError: {},
  },
};
