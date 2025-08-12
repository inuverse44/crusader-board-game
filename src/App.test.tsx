import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders crusader board game', () => {
  render(<App />);
  const titleElement = screen.getByText(/十字軍ボードゲーム/i);
  expect(titleElement).toBeInTheDocument();
});
