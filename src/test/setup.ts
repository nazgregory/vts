import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (global as any).jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: (global as any).jest.fn(), // deprecated
    removeListener: (global as any).jest.fn(), // deprecated
    addEventListener: (global as any).jest.fn(),
    removeEventListener: (global as any).jest.fn(),
    dispatchEvent: (global as any).jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = (global as any).jest.fn().mockImplementation(() => ({
  observe: (global as any).jest.fn(),
  unobserve: (global as any).jest.fn(),
  disconnect: (global as any).jest.fn(),
})); 