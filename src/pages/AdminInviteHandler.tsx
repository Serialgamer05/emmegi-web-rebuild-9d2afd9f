 import { useNavigate } from "react-router-dom";
 import AdminInvitePage from "@/components/admin/AdminInvitePage";
 
 const AdminInviteHandler = () => {
   const navigate = useNavigate();
 
   return <AdminInvitePage onNavigateHome={() => navigate("/")} />;
 };
 
 export default AdminInviteHandler;