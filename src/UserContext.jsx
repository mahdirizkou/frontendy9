import { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); 
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);

  
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedAccess = localStorage.getItem("access_token");
    const savedRefresh = localStorage.getItem("refresh_token");

    if (savedUser && savedAccess && savedRefresh) {
      setUser(JSON.parse(savedUser));
      setAccessToken(savedAccess);
      setRefreshToken(savedRefresh);
    }
  }, []);

  const login = (userData, tokens) => {
    setUser(userData);
    setAccessToken(tokens.access);
    setRefreshToken(tokens.refresh);

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("access_token", tokens.access);
    localStorage.setItem("refresh_token", tokens.refresh);
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);

    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  };

  return (
    <UserContext.Provider value={{ user, accessToken, refreshToken, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
