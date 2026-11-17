import {Toaster} from '@/components/ui/toaster';
import {QueryClientProvider} from '@tanstack/react-query';
import {queryClientInstance} from '@/lib/query-client';
import {BrowserRouter as Router,Route,Routes} from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import {AuthProvider,useAuth} from '@/lib/AuthContext';
import AppLayout from './components/layout/AppLayout';
import Explore from './pages/Explore';
import SavedProjects from './pages/SavedProjects';
import Login from './pages/Login';

function AppRoutes(){
 const {isLoadingAuth}=useAuth();
 if(isLoadingAuth)return <div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"/></div>;
 return <Routes><Route path="/login" element={<Login/>}/><Route element={<AppLayout/>}><Route path="/" element={<Explore/>}/><Route path="/saved" element={<SavedProjects/>}/></Route><Route path="*" element={<PageNotFound/>}/></Routes>;
}
export default function App(){return <AuthProvider><QueryClientProvider client={queryClientInstance}><Router><AppRoutes/></Router><Toaster/></QueryClientProvider></AuthProvider>}
