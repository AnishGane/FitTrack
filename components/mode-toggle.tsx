"use client"
import { MoonIcon, SunIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCallback } from "react"
import { useTheme } from "next-themes";

export function ModeToggle() {
    const { setTheme, theme } = useTheme()

    const toggleTheme = useCallback(() => {
        setTheme(theme === "dark" ? "light" : "dark")
    }, [setTheme, theme]);
    return (
        <Button
            variant="ghost"
            className="group/toggle hover:bg-background [html.dark_&]:hover:bg-background/30 cursor-pointer [html.dark_&]:text-white size-8 p-0 "
            onClick={toggleTheme}
        >
            <SunIcon className="hidden [html.dark_&]:block" />
            <MoonIcon className="hidden [html.light_&]:block" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}