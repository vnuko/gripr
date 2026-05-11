import { setupServer } from 'msw/node';
import { handlers, errorHandlers, networkErrorHandlers } from './handlers.js';

export const server = setupServer(...handlers);

export function setupSuccessServer() {
  server.use(...handlers);
}

export function setupErrorServer() {
  server.use(...errorHandlers);
}

export function setupNetworkErrorServer() {
  server.use(...networkErrorHandlers);
}