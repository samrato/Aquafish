import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = {
              uid: firebaseUser.uid,
              role: userDoc.data().role,
            };
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
          } else {
            await signOut(auth);
            setUser(null);
            localStorage.removeItem("user");

            // const currentUrl = window.location.href;
            // currentUrl.includes("/signUp") ? navigate("/signUp") : navigate("/login");
            navigate("/login")
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUser(null);
        localStorage.removeItem("user");
        const currentUrl = window.location.href;
        currentUrl.includes("/signUp") ? navigate("/signUp") : navigate("/login");
        // navigate("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // ✅ Fix Logout Function
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null); // Clear user state
      localStorage.removeItem("user"); // Remove from storage
      navigate("/login"); // Redirect to login page
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
