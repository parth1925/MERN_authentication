// AppContext.jsx
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { server } from "../main";
import api from "../apiintercepter";
import { toast } from "react-toastify";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const { data } = await api.get(`api/v1/me`);

      setUser(data.user || data); // backend response par depend kare
      setIsAuth(true);
    } catch (error) {
      console.log(
        "Fetch user error:",
        error.response?.data || error.message
      );
      setUser(null);
      setIsAuth(false)
    } finally {
      setLoading(false);
    }
  };

  async function LogoutUser(navigate){
    try {
      const {data} = await api.post('/api/v1/logout')
      toast.success(data.message);
      setIsAuth(false)
      setUser(null)
      navigate("/login")
    } catch (error) {
      toast.error("Something went wrong")
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        isAuth,
        setIsAuth,
        loading,
        LogoutUser
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// custom hook
export const AppData = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("AppData must be used inside AppProvider");
  }
  return context;
};
