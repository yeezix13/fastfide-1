
// Fonction pour générer un token plus court et plus sûr
export const generateShortToken = (userId: string, email: string): string => {
  const timestamp = Date.now().toString();
  const randomString = Math.random().toString(36).substring(2, 8);
  return btoa(`${userId.substring(0, 8)}:${randomString}:${timestamp}`);
};

export const decodeToken = (token: string) => {
  try {
    const decodedToken = atob(token);
    const [userIdPrefix, randomString, timestamp] = decodedToken.split(':');
    return { userIdPrefix, randomString, timestamp: parseInt(timestamp) };
  } catch (error) {
    throw new Error('Invalid token format');
  }
};

export const isTokenExpired = (timestamp: number, hoursValid: number = 24): boolean => {
  const now = Date.now();
  const validDuration = hoursValid * 60 * 60 * 1000;
  return now - timestamp > validDuration;
};
