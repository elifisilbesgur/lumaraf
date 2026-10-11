export type AudioSettings = { playing: boolean; volumes: Record<string, number> };
export type BridgeMessage = { id: string; type: string; payload: Record<string, any> };
export type NativeEvent = { type: string; payload?: any };
/** Kalıcı durumun asgari biçimi. Ayrıntılı normalize işlemi arayüzdeki model.js'tedir. */
export type RafState = { schema: number; books: Record<string, unknown>; reading: unknown[]; ledger: unknown[]; [key: string]: unknown };
export function isRafState(value: unknown): value is RafState {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.schema === 'number' && !!v.books && typeof v.books === 'object' && Array.isArray(v.reading) && Array.isArray(v.ledger);
}
