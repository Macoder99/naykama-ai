import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyForm } from "./verify-form";

export const metadata: Metadata = { title: "Two-factor authentication" };

export default function Verify2faPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}
