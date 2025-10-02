"use client";

import { useState } from "react";
import { apiFetch } from "@/core/api-client";
// import { Button, Input } from "@mdi/design-system";
import { useRouter } from "next/navigation";
import { Input } from "@mdi/design-system";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [step, setStep] = useState<"email" | "code">("email");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function startOtp() {
        setLoading(true);
        try {
            await apiFetch("/api/auth/email/start", {
                method: "POST",
                body: JSON.stringify({ email })
            });
            setStep("code");
        } finally { setLoading(false); }
    }

    async function verifyOtp() {
        setLoading(true);
        try {
            const res = await apiFetch<{ ok: boolean }>("/api/auth/email/verify", {
                method: "POST",
                body: JSON.stringify({ email, code })
            });
            if (res.ok) router.replace("/account");
        } finally { setLoading(false); }
    }

    function googleLogin() {
        window.location.href = "/api/auth/google/start";
    }

    return (
        <main className="p-6 max-w-md mx-auto grid gap-4">
            <h1 className="text-2xl font-semibold">Login</h1>
            {step === "email" ? (
                <>
                    <label className="grid gap-2">
                        <Input type="email"
                            label="Email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="border rounded p-2"
                            placeholder="you@example.com" />

                    </label>
                    <button onClick={startOtp} disabled={loading || !email} className="border rounded p-2">
                        {loading ? "Sending..." : "Send OTP"}
                    </button>
                    <button onClick={googleLogin} className="border rounded p-2">
                        Continue with Google
                    </button>
                </>
            ) : (
                <>
                    <p>We sent a 6-digit code to <b>{email}</b></p>
                    <label className="grid gap-2">
                        <span>Code</span>
                        <input
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            className="border rounded p-2"
                            placeholder="123456"
                        />
                    </label>
                    <button onClick={verifyOtp} disabled={loading || code.length < 4} className="border rounded p-2">
                        {loading ? "Verifying..." : "Verify & Continue"}
                    </button>
                </>
            )}
        </main>
    );
}
