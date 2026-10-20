import { useState } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import Styles from "./_checkout.module.css";
import { CreatePaymentApi, ValidateCouponApi, VerifyPaymentApi } from "../services/api/lmsService";
import { errMsg } from "../utils";

// .env  ->  VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

/* ---------- step 2: card form (inside <Elements>) ---------- */
const PayForm = ({ courseId, couponCode, paymentIntentId, onPaid }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  const pay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setPaying(true);
    setError("");

    // 1) Stripe charges the card
    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (stripeError) {
      setError(stripeError.message || "Payment failed");
      setPaying(false);
      return;
    }

    // 2) our API verifies the payment with Stripe and creates the enrollment
    try {
      await VerifyPaymentApi({
        paymentIntentId: paymentIntent?.id || paymentIntentId,
        courseId,
        ...(couponCode && { couponCode }),
      });
      onPaid();
    } catch (err) {
      setError(errMsg(err, "Payment went through but enrollment failed. Contact support."));
      setPaying(false);
    }
  };

  return (
    <form onSubmit={pay}>
      <PaymentElement />
      {error && <p className={Styles.error}>{error}</p>}
      <div className={Styles.actions}>
        <button className={Styles.btn} disabled={!stripe || paying}>
          {paying ? "Processing..." : "Pay now"}
        </button>
      </div>
    </form>
  );
};

/* ---------- modal: coupon (step 1) -> card (step 2) ---------- */
const CheckoutModal = ({ course, onClose, onPaid }) => {
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState(null); // { code, discount, payable }
  const [intent, setIntent] = useState(null); // { clientSecret, paymentIntentId }
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const price = Number(course.price) || 0;
  const discount = applied ? Number(applied.discount) || 0 : 0;
  const payable = applied?.payable != null ? Number(applied.payable) : price;

  const applyCoupon = async () => {
    if (!code.trim()) return;
    try {
      setBusy(true);
      setError("");
      const res = await ValidateCouponApi({ code: code.trim(), courseId: course._id });
      setApplied({ code: code.trim(), discount: res.discount, payable: res.payable });
    } catch (err) {
      setApplied(null);
      setError(errMsg(err, "Invalid or expired coupon"));
    } finally {
      setBusy(false);
    }
  };

  const continueToPayment = async () => {
    try {
      setBusy(true);
      setError("");
      const res = await CreatePaymentApi({
        courseId: course._id,
        ...(applied && { couponCode: applied.code }),
      });

      // Stripe PaymentIntent: the client secret is what <Elements> needs
      const clientSecret = res.clientSecret ?? res.client_secret;
      if (!clientSecret) throw new Error("Server did not return a Stripe client secret");

      setIntent({ clientSecret, paymentIntentId: res.paymentIntentId ?? res.id });
    } catch (err) {
      setError(errMsg(err, "Could not start payment"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={Styles.overlay} onClick={onClose}>
      <div className={Styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>Checkout – {course.name}</h2>

        <div className={Styles.row}>
          <span>Price</span>
          <span>₹{price}</span>
        </div>
        {applied && (
          <div className={`${Styles.row} ${Styles.discount}`}>
            <span>Coupon ({applied.code})</span>
            <span>− ₹{discount}</span>
          </div>
        )}
        <div className={`${Styles.row} ${Styles.total}`}>
          <span>Total</span>
          <span>₹{payable}</span>
        </div>

        {!stripePromise ? (
          <p className={Styles.error}>
            Stripe key missing. Add VITE_STRIPE_PUBLISHABLE_KEY to your .env file and restart the dev server.
          </p>
        ) : intent ? (
          <Elements stripe={stripePromise} options={{ clientSecret: intent.clientSecret }}>
            <PayForm
              courseId={course._id}
              couponCode={applied?.code}
              paymentIntentId={intent.paymentIntentId}
              onPaid={onPaid}
            />
          </Elements>
        ) : (
          <>
            <div className={Styles.coupon}>
              <input
                type="text"
                placeholder="Coupon code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <button className={`${Styles.btn} ${Styles.ghost}`} disabled={busy || !code.trim()} onClick={applyCoupon}>
                Apply
              </button>
            </div>
            {applied && <p className={Styles.ok}>Coupon applied</p>}

            <div className={Styles.actions}>
              <button className={`${Styles.btn} ${Styles.ghost}`} onClick={onClose}>
                Cancel
              </button>
              <button className={Styles.btn} disabled={busy} onClick={continueToPayment}>
                {busy ? "Please wait..." : "Continue to payment"}
              </button>
            </div>
          </>
        )}

        {error && <p className={Styles.error}>{error}</p>}
      </div>
    </div>
  );
};

export default CheckoutModal;
