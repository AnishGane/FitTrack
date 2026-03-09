"use client"
import { useCallback } from "react"
import { useTheme } from "next-themes";
import { Switch } from "./ui/switch";

export function ModeToggle() {
    const { setTheme, theme } = useTheme()

    const toggleTheme = useCallback(() => {
        setTheme(theme === "dark" ? "light" : "dark")
    }, [setTheme, theme]);
    return (
        <Switch
            checked={theme === "dark" || theme === "system"}
            onCheckedChange={toggleTheme}
            className="cursor-pointer"
        />
    )
}