import { STATE_VERSION, type VaultState } from "./chain";

/**
 * Stan trzymamy w localStorage, żeby demo „pamiętało" portfel po odświeżeniu.
 * Każdy odczyt jest odporny na śmieci: zły JSON albo niezgodna wersja schemy
 * oznaczają po prostu „brak portfela" i powrót do onboardingu.
 */
export function loadState(): VaultState | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem("nexusvault:state:v1");
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const candidate = parsed as Partial<VaultState>;
    if (candidate.version !== STATE_VERSION) return null;
    if (typeof candidate.address !== "string" || !candidate.balances || !candidate.nfts) {
      return null;
    }
    return candidate as VaultState;
  } catch {
    return null;
  }
}

export function saveState(state: VaultState | null): void {
  if (typeof localStorage === "undefined") return;
  try {
    if (!state) localStorage.removeItem("nexusvault:state:v1");
    else localStorage.setItem("nexusvault:state:v1", JSON.stringify(state));
  } catch {
    // Prywatne okno / brak miejsca — demo działa dalej, tylko bez trwałości.
  }
}

export function clearState(): void {
  saveState(null);
}
