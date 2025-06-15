import { Toaster } from "sonner";
import { CommandBuilder } from "./CommandBuilder";
import { DarkModeToggle } from "./DarkModeToggle";
import { useDarkMode } from "./hooks/useDarkMode";
import { useEffect } from "react";

export default function App() {
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen flex flex-col  text-foreground transition-colors duration-200">
      <header className="header /80">
        <div className="header-container">
          <h1 className="header-title">
            <img src="./assets/logo.png" alt="logo" id="logo" onLoad={() => {
              const logo = document.getElementById('logo') as HTMLImageElement;
              const isDark = localStorage.getItem('darkMode') === 'true';
              logo.src = isDark ? './assets/logo.png' : './assets/logo-dark.png';
            }}/>
            Command Builder
          </h1>
          <DarkModeToggle />
        </div>
      </header>

      <main className="flex-1 ">
        <div className="container mx-auto p-4">
          <div className=" rounded-lg p-4">
            <CommandBuilder />
          </div>
        </div>
      </main>

      <footer className=" border-t border-border py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Made by Beyond Bedrock Team</p>
          <p className="mt-1 text-xs text-muted-foreground/80">
            &copy; {new Date().getFullYear()} All rights reserved
          </p>
        </div>
      </footer>
      
      <Toaster 
        position="top-right" 
        richColors 
        closeButton 
        theme={isDarkMode ? "dark" : "light"}
      />
    </div>
  );
}
