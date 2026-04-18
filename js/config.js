// ── Supabase ──────────────────────────────────────────────────────────────────
// Replace these with your actual values from https://supabase.com → Project Settings → API
const SUPABASE_URL      = 'https://wegirdkhskwhndnakkyi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlZ2lyZGtoc2t3aG5kbmFra3lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MDEzMzgsImV4cCI6MjA5MjA3NzMzOH0.9HofuOL-4s0eC7f8VtDX5u3wx_QT8cNqxFPq659DclU';

// ── Stripe Payment Links ───────────────────────────────────────────────────────
// Create these in Stripe Dashboard → Payment Links
// 1. Create a product "AgroMatch Premium" at $10 AUD recurring
// 2. Set the success URL to: https://yourdomain.com/index.html?payment=success
const STRIPE_SUBSCRIPTION_LINK = 'YOUR_STRIPE_SUBSCRIPTION_PAYMENT_LINK';
const STRIPE_PAY_PER_LEAD_LINK  = 'YOUR_STRIPE_PAY_PER_LEAD_PAYMENT_LINK';

// ── Mock data (used as fallback when Supabase is not configured) ───────────────
const MOCK_MACHINES = [
  {
    id: 'mock-1',
    model: 'JOHN DEERE S780',
    type: 'Harvester',
    location: 'QUEENSLAND',
    status: 'Available',
    horsepower: 540,
    daily_rate: 1200,
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjncdgHh954n6Wn7IRfb0E8vYneiyFAKcabcw3OqmsHiU8wZCmjYPnEhJn2BTacKFFpF7wiivxMZsCb0kJqZSkNV7uTxDGNQfZ_il7XG1ptanoiftRNmDpye6Oa5u-_LylUR3RhQUtUM7y5trBq0pUnXH9CfISUOOk3EDg9NIwFFjBIo1vkn7Z4O_JG5RQCVokk8H5RoT0s0c7wW6PeAoR8-Woq037_ip_VfzBJBFqfrEHAGcNhw5Xl6JbmWtE6erTUSTa26y5nhw',
    spec1_label: 'Power Output', spec1_value: '540 HP',
    spec2_label: 'Grain Tank',   spec2_value: '14,100 L'
  },
  {
    id: 'mock-2',
    model: 'JOHN DEERE 8R 410',
    type: 'Tractor',
    location: 'WESTERN AUSTRALIA',
    status: 'Available',
    horsepower: 450,
    daily_rate: 800,
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDj93cdtag0rXA82fjL-Xdz2Ui7oSTSmCDrBnBSmIRk4YRtn9Eup_u3Sji10h9KgfRd4jO3tIcP8mxz4ve-XI_HYYaA50q-4-e1qtQuMUwsYFHArgqigcc_cAiXFmordRoFJc74gJ7f6UpGw8wdjVdadb8YLYkUYX2FmjAY6Q56FKxHUuE4-Dwii9CXy4WXpiqo4eJr0RzKpLFBv70GNfcjEj7_yvcbC-KaxAbvRwDYNEOJqL-uCFfDF8QA6HsqF0oRJyBqEeEjTnM',
    spec1_label: 'Engine Power', spec1_value: '450 HP',
    spec2_label: 'Daily Rate',   spec2_value: '$800 AUD'
  },
  {
    id: 'mock-3',
    model: 'R4038 SPRAYER',
    type: 'Sprayer',
    location: 'NEW SOUTH WALES',
    status: 'Available',
    horsepower: 280,
    daily_rate: 650,
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdVfsdOczaHWwKznlVSLraX-XqsIk4t0cUZpw39xDDk59ReU9_vxHC0MDgl8dJvdHCqlL4VjIiqfJm-g0a_BIb4K_pKGlxW55U3SXxZsRk2W_EtVaYy5kOvJAI',
    spec1_label: 'Boom Width',   spec1_value: '120 FT',
    spec2_label: 'Tank Cap.',    spec2_value: '4,800 L'
  },
  {
    id: 'mock-4',
    model: 'S7 900 HARVESTER',
    type: 'Harvester',
    location: 'VICTORIA',
    status: 'Available',
    horsepower: 480,
    daily_rate: 1400,
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqFaD6h-uZWzi630KNzfDQfGxNLNigr6bpSrXJGsB1X68521sh-mpYFJsC0oXRInxSEL7ueZbqtV6MOUxFAJ_pVJzMlivtkcA4HOuKLMO3YH8YmG0JZZn_XEVbCMjB11zBU8osMq9gE3zsLFWY_55tCNW31a2LD_bs2pNyqZiVYuORuIb4ExtMfM-3Drp1owMFasjWtikkpSdIZa8b5RQCeWXg6Gup9Dchodj7YeAPHqKPLghRnrplv3J7Y0ieVBCgMlbnRVjfO1U',
    spec1_label: 'Engine HP',   spec1_value: '480 HP',
    spec2_label: 'Daily Rate',  spec2_value: '$1,400 AUD'
  }
];
