
"use client";
import type { FC } from "react";
import React, { useState, useEffect } from "react";
// import { SidebarTrigger } from "@/components/ui/sidebar"; // Removed
import { Button } from "@/components/ui/button";
import { Bot, Sun, Moon, Wand2 } from "lucide-react"; 

const ThemeToggle: FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(true); 

  useEffect(() => {
    const root = window.document.documentElement;
    const initialTheme = localStorage.getItem("theme");

    if (initialTheme === "dark" || (!initialTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      root.classList.add("dark");
      setIsDarkMode(true);
    } else {
      root.classList.remove("dark");
      setIsDarkMode(false);
    }
  }, []);

  const toggleTheme = () => {
    const root = window.document.documentElement;
    root.classList.toggle("dark");
    setIsDarkMode(!isDarkMode);
    localStorage.setItem("theme", !isDarkMode ? "dark" : "light");
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
      {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
};

const AppHeader: FC = () => {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      {/* <div className="md:hidden"> // Removed SidebarTrigger container
        <SidebarTrigger />
      </div> */}
      <div className="flex items-center gap-2">
        <Wand2 className="h-6 w-6 text-primary" /> {/* Using Wand2 as an icon for AI Prompt Studio */}
        <h1 className="text-xl font-semibold text-foreground">AI Prompt Studio</h1>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <ThemeToggle />
        {/* User avatar/menu can go here */}
      </div>
    </header>
  );
};

export default AppHeader;
