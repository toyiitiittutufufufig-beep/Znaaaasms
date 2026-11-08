const ERRORS: Record<string, string> = {
  BAD_CREDENTIALS: "Wrong username or password",
  ACCOUNT_NOT_ACTIVE: "Your account is not active. Contact the administrator.",
  NO_BALANCE: "Insufficient balance",
  NO_NUMBERS: "No numbers available right now. You were not charged.",
  NO_PRICE: "This service / country is not available",
  EARLY_CANCEL_DENIED: "Too early to cancel, try again in a minute",
  CANNOT_CANCEL: "This number can't be cancelled",
  USERNAME_TAKEN: "Username already taken",
  INVALID_USERNAME: "Username: 3-32 chars (a-z, 0-9, _ . -)",
  PASSWORD_TOO_SHORT: "Password must be at least 6 characters",
  NEGATIVE_BALANCE: "Balance can't go below zero",
  INVALID_AMOUNT: "Invalid amount",
  CANNOT_DISABLE_SELF: "You can't disable your own account",
  CANNOT_DELETE_ADMIN: "Admin accounts can't be deleted",
  FORBIDDEN: "Not allowed",
};

export async function api<T = any>(path: string, opts?: { method?: string; body?: unknown }): Promise<T> {
  const r = await fetch(path, {
    method: opts?.method ?? (opts?.body !== undefined ? "POST" : "GET"),
    headers: opts?.body !== undefined ? { "content-type": "application/json" } : undefined,
    body: opts?.body !== undefined ? JSON.stringify(opts.body) : undefined,
    cache: "no-store",
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    if (r.status === 401 && !path.includes("/auth/")) location.href = "/login";
    throw new Error(ERRORS[j.error] ?? j.error ?? "Something went wrong");
  }
  return j as T;
}
