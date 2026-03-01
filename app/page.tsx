import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

const PageGuard = async (): Promise<React.ReactNode> => {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (session?.user) {
        redirect("/dashboard");
    } else {
        redirect("/login");
    }

    return null;
}

export default async function Page() {
    return (
        <Suspense fallback={null}>
            <PageGuard />
        </Suspense>
    )
}