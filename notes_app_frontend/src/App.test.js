import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders notes app header", () => {
  render(<App />);
  const heading = screen.getByRole("heading", { name: /notes — ocean professional/i });
  expect(heading).toBeInTheDocument();
});
