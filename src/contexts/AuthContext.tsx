import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export interface UserData {
  uid: string;
  nome: string;
  email: string;
  telefone: string;
  data_nascimento?: string;
  data_registro: Date;
  pontos_fidelidade: number;
  saldo: number;
  isAdmin: boolean;
  ativo: boolean;
  avatar_url?: string;
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const refreshUserData = async () => {
    if (!currentUser) {
      setUserData(null);
      sessionStorage.removeItem('userData');
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, 'usuarios', currentUser.uid));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        const userData: UserData = {
          uid: currentUser.uid,
          nome: data.nome || '',
          email: data.email || currentUser.email || '',
          telefone: data.telefone || '',
          data_nascimento: data.data_nascimento,
          data_registro: data.data_registro?.toDate() || new Date(),
          pontos_fidelidade: data.pontos_fidelidade || 0,
          saldo: data.saldo || 0,
          isAdmin: data.isAdmin || false,
          ativo: data.ativo !== undefined ? data.ativo : true,
          avatar_url: data.avatar_url || ''
        };
        setUserData(userData);
        sessionStorage.setItem('userData', JSON.stringify(userData));
      } else {
        // Se o documento não existe, cria um novo com dados básicos
        const newUserData: UserData = {
          uid: currentUser.uid,
          nome: currentUser.displayName || '',
          email: currentUser.email || '',
          telefone: '',
          data_registro: new Date(),
          pontos_fidelidade: 0,
          saldo: 0,
          isAdmin: false,
          ativo: true
        };
        
        await setDoc(doc(db, 'usuarios', currentUser.uid), newUserData);
        setUserData(newUserData);
        sessionStorage.setItem('userData', JSON.stringify(newUserData));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do usuário.",
        variant: "destructive"
      });
    }
  };

  const updateUserData = async (data: Partial<UserData>) => {
    if (!currentUser) return;

    try {
      await setDoc(doc(db, 'usuarios', currentUser.uid), data, { merge: true });
      await refreshUserData();
    } catch (error) {
      console.error('Error updating user data:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os dados do usuário.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserData(null);
      sessionStorage.removeItem('userData');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Erro",
        description: "Não foi possível fazer logout.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Verifica se há dados em sessionStorage antes de fazer fetch
        const storedUserData = sessionStorage.getItem('userData');
        if (storedUserData) {
          setUserData(JSON.parse(storedUserData));
        }
        await refreshUserData();
      } else {
        setUserData(null);
        sessionStorage.removeItem('userData');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    loading,
    logout,
    refreshUserData,
    updateUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};