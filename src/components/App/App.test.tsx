import { MemoryRouter } from "react-router-dom";
import { test, expect } from "vitest";
import App from "~/components/App/App";
import { server } from "~/mocks/server";
import { rest } from "msw";
import API_PATHS from "~/constants/apiPaths";
import { CartItem } from "~/models/CartItem";
import { HTTPResponse } from "~/queries/products";
import { renderWithProviders } from "~/testUtils";
import { screen, waitForElementToBeRemoved } from "@testing-library/react";
import { formatAsPrice } from "~/utils/utils";

test("Renders products list", async () => {
  const response = {
    status: "success",
    data: [
      {
        id: "1",
        title: "Product 1",
        description: "Product 1 description",
        price: 1,
        count: 1,
        imageUrl: "https://test.com",
      },
      {
        id: "2",
        title: "Product 2",
        description: "Product 2 description",
        price: 2,
        count: 2,
        imageUrl: "https://test.com",
      },
    ],
  };
  server.use(
    rest.get(`${API_PATHS.bff}/products`, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.delay(),
        ctx.json<HTTPResponse>(response)
      );
    }),
    rest.get(`${API_PATHS.cart}/profile/cart`, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json<CartItem[]>([]));
    })
  );
  renderWithProviders(
    <MemoryRouter initialEntries={["/"]}>
      <App />
    </MemoryRouter>
  );

  await waitForElementToBeRemoved(() => screen.queryByText(/Loading/));
  response.data.forEach((product) => {
    expect(screen.getByText(product.title)).toBeInTheDocument();
    expect(screen.getByText(formatAsPrice(product.price))).toBeInTheDocument();
  });
});
