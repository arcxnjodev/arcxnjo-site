export const isTokenValid = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

export const isLoggedIn = () => {
  const token = localStorage.getItem("token");

  if (!token) return false;

  if (!isTokenValid(token)) {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("user");
    return false;
  }

  return true;
};