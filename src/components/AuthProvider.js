"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";

const AuthContext = createContext({
  user: null,
  loading: true,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Escuta mudanças no estado de autenticação apenas uma vez no mount
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Lógica de proteção de rotas reativa ao estado do usuário e URL atual
    if (loading) return;

    if (!user && pathname !== "/login") {
      router.push("/login");
    }
    
    if (user && pathname === "/login") {
      router.push("/");
    }
  }, [user, loading, pathname, router]);

  // DEBUG: Monitoramento do estado de autenticação
  console.log("AuthProvider State:", { loading, user: user?.email, pathname });

  // Determina se devemos mostrar o conteúdo real ou a tela de carregamento/proteção
  const shouldShowContent = !loading && (user || pathname === "/login");

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {shouldShowContent ? children : (
        <div className="min-h-screen bg-[#05070a] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-slate-500 text-sm font-medium animate-pulse">
              {pathname === "/login" ? "Preparando acesso..." : "Sincronizando com Mantovani..."}
            </p>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);
