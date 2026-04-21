import { Dumbbell } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen w-full overflow-hidden">
            <div className="grid min-h-svh lg:grid-cols-2">
                <div className="flex flex-col gap-4 p-6 md:p-10 z-99">
                    <div className="flex justify-center gap-2 md:justify-start">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="bg-primary flex text-white size-7 items-center justify-center rounded-md">
                                <Dumbbell className="size-5" />
                            </div>
                            <span className='text-black font-bold text-2xl'>
                                FitTrack
                            </span>
                        </Link>
                    </div>
                    <div className="flex flex-1 items-center justify-center">
                        <div className="w-full max-w-sm mx-auto z-99">
                            {children}
                        </div>
                    </div>
                </div>
                <div className="min-h-screen relative hidden lg:flex flex-col items-center justify-center w-full">
                    {/* Emerald Void */}
                    <div
                        className="absolute inset-0 z-0"
                        style={{
                            background: "radial-gradient(125% 125% at 50% 10%, #000000 40%, #072607 100%)",
                        }}
                    />
                    {/* Main Content */}
                    <div className="relative flex flex-col z-30 min-h-screen w-full max-w-md items-center justify-center px-8">
                        <h2 className="text-5xl font-medium tracking-wide uppercase text-white mb-4 text-center">
                            Welcome to <br /> FitTrack
                        </h2>
                        <p className="text-sm text-white/80 mt-4 mb-2 text-left">
                            Your all-in-one workout tracker for setting, monitoring, and achieving your fitness goals.
                        </p>
                        <p className="text-sm text-white/80 text-right">
                            Sign in to start logging your workouts, tracking progress, and staying motivated on your fitness journey.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default layout