import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'barbergo:booking-access-tokens';

async function readTokenMap(): Promise<Record<string, string>> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

async function writeTokenMap(map: Record<string, string>): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export async function saveBookingAccessToken(bookingId: string, accessToken: string): Promise<void> {
  const map = await readTokenMap();
  map[bookingId] = accessToken;
  await writeTokenMap(map);
}

export async function getBookingAccessToken(bookingId: string): Promise<string | undefined> {
  const map = await readTokenMap();
  return map[bookingId];
}

export async function removeBookingAccessToken(bookingId: string): Promise<void> {
  const map = await readTokenMap();
  delete map[bookingId];
  await writeTokenMap(map);
}
