import { getStoredUser } from './session';

describe('getStoredUser', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('rejects malformed serialized data without throwing', () => {
    localStorage.setItem('usuario', '{"rol":');

    expect(getStoredUser()).toBeNull();
    expect(localStorage.getItem('usuario')).toBeNull();
  });

  test('rejects session data with an unexpected role', () => {
    localStorage.setItem(
      'usuario',
      JSON.stringify({ id: 'user-id', rol: 'administrador' })
    );

    expect(getStoredUser()).toBeNull();
  });
});
