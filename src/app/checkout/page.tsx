import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutView } from "./checkout-view";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutView />
    </Suspense>
  );
}
