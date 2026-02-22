import { LoginForm } from '@/components/forms/login-form'
import { Salad } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen w-full bg-white relative overflow-hidden">
            {/* Soft Blue Radial Background */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    background: "#ffffff",
                    backgroundImage: `
       radial-gradient(circle at top center, rgba(59, 130, 246, 0.5),transparent 70%)
     `,
                }}
            />
            {/* Your Content Here */}
            <div className="grid min-h-svh lg:grid-cols-2">
                <div className="flex flex-col gap-4 p-6 md:p-10 z-99">
                    <div className="flex justify-center gap-2 md:justify-start">
                        <Link href="/" className="flex items-center gap-2 font-semibold">
                            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                                <Salad className="size-4" />
                            </div>
                            FitTrack
                        </Link>
                    </div>
                    <div className="flex flex-1 items-center justify-center">
                        <div className="w-full max-w-xs z-99">
                            {/* <LoginForm /> */}
                            {children}
                        </div>
                    </div>
                </div>
                <div className=" relative hidden lg:block">
                    <img
                        src="/MacBook Pro 14.png"
                        alt="Image"
                        className="absolute top-1/2 -left-10 rotate-2  -translate-y-1/2 w-full object-cover"
                    />
                </div>
            </div>
        </div>
    )
}

export default layout