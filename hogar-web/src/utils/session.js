const USER_STORAGE_KEY = 'usuario';
const ALLOWED_ROLES = ['cliente', 'trabajador'];

export function getStoredUser() {
  const storedUser = localStorage.getItem(USER_STORAGE_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    const user = JSON.parse(storedUser);
    const hasValidIdentity =
      user &&
      typeof user === 'object' &&
      typeof user.id === 'string' &&
      ALLOWED_ROLES.includes(user.rol);

    if (!hasValidIdentity) {
      localStorage.removeItem(USER_STORAGE_KEY);
      return null;
    }

    return user;
  } catch (error) {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}
