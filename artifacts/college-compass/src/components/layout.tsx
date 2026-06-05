import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { BookOpen, Map, Heart, LogOut, Menu } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, logout } = useAuth();
  const [location, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex flex-col w-full bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
              <BookOpen className="w-6 h-6" />
              <span>CollegeCompass</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="/colleges" className="text-muted-foreground hover:text-foreground transition-colors">
                Colleges
              </Link>
              <Link href="/compare" className="text-muted-foreground hover:text-foreground transition-colors">
                Compare
              </Link>
              <Link href="/predictor" className="text-muted-foreground hover:text-foreground transition-colors">
                Predictor
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <Link href="/saved" className="hidden sm:flex text-sm font-medium text-muted-foreground hover:text-foreground items-center gap-1.5">
                  <Heart className="w-4 h-4" />
                  Saved
                </Link>
                <Button variant="ghost" size="sm" onClick={() => { logout(); setLocation("/"); }}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-1 w-full max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8">
        {children}
      </main>
      
      <footer className="w-full border-t border-border bg-card py-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <div className="flex justify-center items-center gap-2 mb-4 font-semibold text-foreground">
            <BookOpen className="w-5 h-5" /> CollegeCompass
          </div>
          <p>Find your true north in education.</p>
          <p className="mt-8">&copy; {new Date().getFullYear()} CollegeCompass. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
