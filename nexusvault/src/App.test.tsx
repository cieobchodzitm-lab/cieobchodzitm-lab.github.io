import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

/**
 * Dymny test interfejsu: czy aplikacja w ogóle się podnosi, czy da się
 * utworzyć portfel, przełączyć zakładkę i kupić pierwsze NFT.
 * Logika łańcucha jest przetestowana osobno w chain.test.ts.
 */
describe("App — dymny test interfejsu", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("bez portfela pokazuje ekran startowy z informacją, że to demo", () => {
    render(<App />);
    expect(
      screen.getByText(/To demo, nie prawdziwy portfel/i),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /Utwórz portfel demo/i }),
    ).toBeTruthy();
  });

  it("po utworzeniu portfela widać saldo i adres", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Utwórz portfel demo/i }));

    expect(screen.getByText(/Wartość portfela/i)).toBeTruthy();
    // Saldo startowe: 850 NEX
    expect(screen.getByText("850")).toBeTruthy();
    expect(screen.getByText(/blok #/i)).toBeTruthy();
  });

  it("można przejść na rynek i kupić pierwsze NFT", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Utwórz portfel demo/i }));
    await user.click(screen.getByRole("tab", { name: /Rynek/i }));

    // Karta rynku: przynajmniej jedna oferta z przyciskiem „Kup"
    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: /^Kup$/ }).length).toBeGreaterThan(0);
    });

    const buyButtons = screen.getAllByRole("button", { name: /^Kup$/ });
    await user.click(buyButtons[0]!);

    // Zakup idzie przez „sieć" (symulowane 550 ms) — czekamy na potwierdzenie
    await waitFor(() => expect(screen.getByText(/Kupiono/i)).toBeTruthy(), {
      timeout: 4000,
    });

    // Po zakupie przedmiot powinien pojawić się w kolekcji
    await user.click(screen.getByRole("tab", { name: /Kolekcja/i }));
    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: /Wystaw/ }).length).toBeGreaterThan(0);
    });
  });

  it("stan portfela jest pamiętany po ponownym zamontowaniu", async () => {
    const user = userEvent.setup();
    const first = render(<App />);
    await user.click(screen.getByRole("button", { name: /Utwórz portfel demo/i }));
    first.unmount();

    render(<App />);
    // Brak ekranu startowego → portfel został odtworzony z localStorage
    expect(screen.queryByRole("button", { name: /Utwórz portfel demo/i })).toBeNull();
    expect(screen.getByText(/Wartość portfela/i)).toBeTruthy();
  });

  it("zakładka Wyślij ma formularz z walidacją adresu", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /Utwórz portfel demo/i }));
    await user.click(screen.getByRole("tab", { name: /Wyślij/i }));

    const form = screen.getByLabelText(/Adres odbiorcy/i);
    await user.type(form, "0x123");
    await user.type(screen.getByLabelText(/Kwota/i), "1");

    const sendButton = screen.getByRole("button", { name: /^Wyślij$/ });
    await waitFor(() => {
      expect(sendButton.getAttribute("disabled")).not.toBeNull();
    });
    expect(within(document.body).getByText(/0x i 40 znaków hex/i)).toBeTruthy();
  });
});
