import '@testing-library/jest-dom'; // Ensure this is imported
import { render, screen } from '@testing-library/react';

const TestComponent: React.FC = () => <h1>Hello, Jest!</h1>;

test('renders the component', () => {
  render(<TestComponent />);
  expect(screen.getByText('Hello, Jest!')).toBeInTheDocument();
});
