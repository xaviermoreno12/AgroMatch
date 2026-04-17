window.StripeAPI = {
  redirectToSubscription() {
    if (!STRIPE_SUBSCRIPTION_LINK || STRIPE_SUBSCRIPTION_LINK === 'YOUR_STRIPE_SUBSCRIPTION_PAYMENT_LINK') {
      alert('Stripe no configurado aún.\n\nPasos:\n1. Creá una cuenta en stripe.com\n2. Creá un Payment Link de $10 AUD mensual\n3. Pegá la URL en js/config.js → STRIPE_SUBSCRIPTION_LINK');
      return;
    }
    window.location.href = STRIPE_SUBSCRIPTION_LINK;
  },

  redirectToPayPerLead(machineId) {
    if (!STRIPE_PAY_PER_LEAD_LINK || STRIPE_PAY_PER_LEAD_LINK === 'YOUR_STRIPE_PAY_PER_LEAD_PAYMENT_LINK') {
      alert('Stripe Pay-per-lead no configurado aún.\n\nCreá un segundo Payment Link y pegalo en js/config.js → STRIPE_PAY_PER_LEAD_LINK');
      return;
    }
    // Append machine context to the success URL via client_reference_id
    const link = new URL(STRIPE_PAY_PER_LEAD_LINK);
    link.searchParams.set('client_reference_id', machineId || '');
    window.location.href = link.toString();
  }
};
