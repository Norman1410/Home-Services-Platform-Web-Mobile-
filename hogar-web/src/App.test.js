import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
}));

beforeEach(() => {
  localStorage.clear();
});

test('renders login when there is no active session', () => {
  render(<App />);
  expect(screen.getByRole('button', { name: /iniciar/i })).toBeInTheDocument();
});

test('discards a malformed stored session instead of crashing the application', () => {
  localStorage.setItem('usuario', '{"id":');

  render(<App />);

  expect(screen.getByRole('button', { name: /iniciar/i })).toBeInTheDocument();
  expect(localStorage.getItem('usuario')).toBeNull();
});
