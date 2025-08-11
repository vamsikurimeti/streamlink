"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import AuthForm from "@/components/auth/auth-form";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [errorHandled, setErrorHandled] = useState(false);

  useEffect(() => {
    // Avoid re-triggering toast on every render
    if (errorHandled) return;

    const error = searchParams.get("error");
    if (error) {
      let description =
        "An unexpected error occurred. Please try again.";

      switch (error) {
        case "oauth_failed":
          description = "Google sign-in failed. Please try again.";
          break;
        case "server_config":
          description =
            "There is a server configuration issue. Please contact support.";
          break;
        case "token_exchange_failed":
          description =
            "Could not verify your Google account. Please try again.";
          break;
      }

      // Log unexpected issues for GCP debugging
      if (process.env.NEXT_PUBLIC_ENV === "production") {
        fetch("/api/log-client-error", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error, description, page: "login" }),
        }).catch(() => {});
      }

      toast({
        variant: "destructive",
        title: "Authentication Error",
        description,
      });

      setErrorHandled(true);
    }
  }, [searchParams, toast, errorHandled]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <AuthForm mode="login" />
      </Suspense>
    </div>
  );
}
