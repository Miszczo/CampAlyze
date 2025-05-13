// Funkcja do sprawdzania statusu sesji użytkownika (do mockowania w testach)
export const checkSessionStatus = async (): Promise<boolean> => {
  // W prawdziwej aplikacji mogłoby to być sprawdzenie localStorage, cookie lub zapytanie do API
  return Promise.resolve(false);
};
