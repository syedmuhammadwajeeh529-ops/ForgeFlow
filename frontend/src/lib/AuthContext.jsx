import React,{createContext,useContext,useEffect,useState}from'react';
import{apiRequest,base44,getToken,setToken}from'@/api/base44Client';
const AuthContext=createContext(null);
export function AuthProvider({children}){
 const[user,setUser]=useState(null);const[isLoadingAuth,setIsLoadingAuth]=useState(true);const[authError,setAuthError]=useState(null);const[appPublicSettings]=useState({authentication:'email-password'});
 const checkAppState=async()=>{const token=getToken();if(!token){setUser(null);setIsLoadingAuth(false);return}setIsLoadingAuth(true);try{const current=await base44.auth.me();setUser(current);setAuthError(null)}catch(error){setToken(null);setUser(null);if(error.status!==401)setAuthError({type:'unknown',message:error.message})}finally{setIsLoadingAuth(false)}};
 useEffect(()=>{checkAppState()},[]);
 const login=async credentials=>{const result=await apiRequest('/auth/login',{method:'POST',body:credentials});setToken(result.token);setUser(result.user);setAuthError(null);return result.user};
 const register=async details=>{const result=await apiRequest('/auth/register',{method:'POST',body:details});setToken(result.token);setUser(result.user);setAuthError(null);return result.user};
 const logout=async()=>{try{await base44.auth.logout()}catch{}finally{setToken(null);setUser(null);window.location.assign('/login')}};const navigateToLogin=()=>base44.auth.redirectToLogin();
 return <AuthContext.Provider value={{user,isAuthenticated:!!user,isLoadingAuth,isLoadingPublicSettings:false,authError,appPublicSettings,logout,navigateToLogin,checkAppState,login,register}}>{children}</AuthContext.Provider>
}
export function useAuth(){const value=useContext(AuthContext);if(!value)throw new Error('useAuth must be used within an AuthProvider');return value}
