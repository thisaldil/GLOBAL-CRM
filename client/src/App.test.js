import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the login page for unauthenticated users", async () => {
  render(<App />);
  expect(await screen.findByRole("heading", { name: /welcome back/i })).toBeInTheDocument();
});
