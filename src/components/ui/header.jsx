import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="w-full p-4 sm:px-10 flex items-center justify-between bg-white/60 backdrop-blur-md shadow-sm border-b border-gray-200">
      <h1 className="text-xl font-semibold tracking-tight text-gray-900">Manova</h1>
      <button
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition"
        aria-label="Logout"
        onClick={handleLogout}
      >
        <LogOut className="w-4 h-4" />
        Logout
      </button>
    </header>
  );
}; 