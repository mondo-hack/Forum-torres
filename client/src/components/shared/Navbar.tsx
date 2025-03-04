import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  FileText,
  LogIn,
  UserPlus,
  LogOut,
  Home,
  User
} from "lucide-react";
import { getUser, removeUser } from "@/lib/storage";

export default function Navbar() {
  const [location] = useLocation();
  const user = getUser();

  const handleLogout = () => {
    removeUser();
    window.location.href = '/';
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/">
              <a className="flex items-center gap-2 font-bold text-lg">
                <Home className="h-5 w-5" />
                ForumChat
              </a>
            </Link>

            {user && (
              <div className="hidden md:flex items-center space-x-1">
                <Link href="/chat">
                  <Button
                    variant={location === "/chat" ? "default" : "ghost"}
                    className="flex items-center"
                    size="sm"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Chat
                  </Button>
                </Link>
                <Link href="/forum">
                  <Button
                    variant={location === "/forum" ? "default" : "ghost"}
                    className="flex items-center"
                    size="sm"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Forum
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link href="/profile">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center"
                  ><span className="hidden md:inline">Profil</span>
                  </Button>
                </Link>
                <span className="text-sm text-muted-foreground hidden md:inline">
                  Hai, {user.username}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">Keluar</span>
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="flex items-center">
                    <LogIn className="h-4 w-4 mr-2" />
                    <span className="hidden md:inline">Masuk</span>
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="default" size="sm" className="flex items-center">
                    <UserPlus className="h-4 w-4 mr-2" />
                    <span className="hidden md:inline">Daftar</span>
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
                    <User className="h-4 w-4 mr-2" />
