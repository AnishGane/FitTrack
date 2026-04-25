import Link from "next/link"
import React from "react"

const layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen w-full flex items-center gap-8 justify-center flex-col">{children}
            <p>
                Go back to &nbsp;
                <Link href="/login" className="cursor-pointer underline hover:text-blue-400 transition-all duration-200">login page </Link>
            </p>
        </div>
    )
}

export default layout