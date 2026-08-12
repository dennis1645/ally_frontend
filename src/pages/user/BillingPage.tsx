import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  Coins,
  Mountain,
  Package,
  RefreshCcw,
  XCircle,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router";

import tokenLogo from "../../assets/token-logo.png";

import {
  getShopItemsApi,
  type ShopItem,
} from "../../api/shopApi";

import UserLayout from "../../components/layout/UserLayout";

import {
  useAuth,
} from "../../context/AuthContext";

/* =========================================================
   Types
========================================================= */

type FeatureDef = {
  name: string;
  value: boolean | string;
  cross?: boolean;
};

type FeatureItemProps = {
  feature: FeatureDef;
  light?: boolean;
};

/* =========================================================
   Feature Matrix Logic
========================================================= */

function getFeaturesForPlan(planType: "free" | "explorer" | "conqueror"): FeatureDef[] {
  return [
    { name: "Initial Assessment", value: true },
    { name: "Scholarship Finder", value: true },
    { name: "Basic Profile Builder", value: true },
    { name: "Scholarship Bookmarking", value: true },
    { name: "Buy Tokens & Book Mentors", value: true },
    {
      name: "Roadmap Timeline",
      value: planType === "free" ? "General only" : "Custom",
      cross: planType === "free",
    },
    {
      name: "Ally Coaching (AI)",
      value: planType === "free" ? false : planType === "explorer" ? "2x / day" : "3x / day",
    },
    {
      name: "Mentor Tokens Included",
      value: planType === "free" ? false : planType === "explorer" ? "2 Tokens" : "4 Tokens",
    },
  ];
}

/* =========================================================
   Helpers
========================================================= */

function formatRupiah(value: string | number): string {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return "Rp0";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(parsed)
    .replace(/IDR/g, "Rp")
    .replace(/\s/g, "");
}

function formatPremiumDate(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getTokenBenefits(item: ShopItem): string[] {
  const benefits: string[] = [];

  if (item.token_reward > 0) {
    benefits.push(`${item.token_reward} Mentor ${item.token_reward === 1 ? "Token" : "Tokens"}`);
  }

  benefits.push("Use tokens for mentor consultation bookings");
  return benefits;
}

/* =========================================================
   Feature item Component
========================================================= */

function FeatureItem({ feature, light = false }: FeatureItemProps) {
  const isCross = feature.value === false || feature.cross === true;
  const Icon = isCross ? XCircle : CheckCircle2;
  
  const iconColor = light
    ? isCross ? "text-white/40" : "text-[#9bcaff]"
    : isCross ? "text-gray-300" : "text-[#3b82c4]";

  const textColor = light
    ? isCross ? "text-white/50" : "text-white"
    : isCross ? "text-gray-400" : "text-inherit";

  return (
    <li className={`flex items-start gap-3 ${textColor}`}>
      <Icon size={21} className={`mt-0.5 shrink-0 ${iconColor}`} />
      <span>
        {feature.name}
        {typeof feature.value === "string" ? (
          <span className={isCross ? " ml-1" : " font-semibold ml-1"}>
            ({feature.value})
          </span>
        ) : null}
      </span>
    </li>
  );
}

/* =========================================================
   Static Premium Plans Data
========================================================= */
const staticPremiumPlans = [
  {
    id: 101, 
    name: "Explorer",
    type: "explorer" as const,
    price: 65000,
    tagline: "The 3-Month Sprint",
    hoverDesc: "Perfect for final year students or those sprinting for short-term preparation. Ideal for focusing on upcoming scholarship deadlines."
  },
  {
    id: 102, 
    name: "Conqueror",
    type: "conqueror" as const,
    price: 150000,
    tagline: "The Ultimate Journey",
    hoverDesc: "Perfect for busy professionals, those taking a career break, or students planning from scratch. The most complete and cost-effective access for a long-term journey."
  }
];

/* =========================================================
   Billing page
========================================================= */

export default function BillingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadVersion, setReloadVersion] = useState(0);

  const fullQuote = "“Every expedition begins with the right equipment. Choose the plan that helps you reach your scholarship summit.”";
  const [quoteText, setQuoteText] = useState("");

  /* =======================================================
     Typewriter Effect
  ======================================================= */
  useEffect(() => {
    let currentLength = 0;
    const timer = setInterval(() => {
      currentLength += 1;
      setQuoteText(fullQuote.substring(0, currentLength));
      if (currentLength >= fullQuote.length) {
        clearInterval(timer);
      }
    }, 35);

    return () => clearInterval(timer);
  }, []);

  /* =======================================================
     Load backend shop items
  ======================================================= */
  useEffect(() => {
    let active = true;

    async function loadShopItems(): Promise<void> {
      setLoadError(null);
      try {
        const responseItems = await getShopItemsApi();
        if (!active) return;
        setItems(responseItems.filter((item) => item.is_active));
      } catch (error: unknown) {
        if (!active) return;
        setItems([]);
        setLoadError(
          error instanceof Error ? error.message : "Unable to load expedition shop items."
        );
      }
    }

    void loadShopItems();
    return () => {
      active = false;
    };
  }, [reloadVersion]);

  const tokenItems = useMemo(
    () => items.filter((item) => item.item_type === "token_package"),
    [items]
  );

  /* =======================================================
     Current plan & Actions
  ======================================================= */
  const isPremium = user?.is_premium === true;
  const premiumUntil = formatPremiumDate(user?.premium_until);
  const planName = isPremium ? "Premium" : "Explorer (Free)";
  const planStatus = isPremium ? "Premium" : "Active";
  const checkpointText = isPremium
    ? premiumUntil
      ? `Premium access until ${premiumUntil}`
      : "Premium expedition access is active"
    : "Free plan";

  function handleChooseItem(itemId: number): void {
    navigate(`/checkout?item=${itemId}`);
  }

  function handleRetry(): void {
    setReloadVersion((current) => current + 1);
  }

  function scrollToSection(elementId: string): void {
    const section = document.getElementById(elementId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  }

  /* =======================================================
     UI
  ======================================================= */
  return (
    <UserLayout
      title="Subscription"
      subtitle="Expedition Plans"
      topbarProps={{ showSearch: false }}
    >
      <section className="min-h-[calc(100vh-80px)] bg-[#fff8f5]">
        <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          
          {/* =================================================
              Current plan, Tokens, & Upgrade Button
          ================================================== */}
          <article className="mb-10 rounded-[24px] border-2 border-[#ead3bd] bg-white px-5 py-6 shadow-[5px_5px_0_#ddcbb0] sm:px-7 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              
              <div className="flex min-w-0 items-center gap-5">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#ffe3d2] text-[#16629b]">
                  <Mountain size={31} strokeWidth={2.5} fill="currentColor" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-bold text-[#2c1607] sm:text-2xl">
                      {planName}
                    </h3>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ffdcc6] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#7a582f]">
                      <BadgeCheck size={13} />
                      {planStatus}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm italic leading-6 text-[#5f626a] sm:text-base">
                    {checkpointText}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 border-t border-[#ead3bd] pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                <div className="flex items-center gap-3">
                  <img src={tokenLogo} alt="Mentor Token" className="h-10 w-10 drop-shadow-sm" />
                  <div>
                    <p className="text-xs font-bold text-[#6b6670] uppercase tracking-wider">Balance</p>
                    <p className="text-xl font-extrabold text-[#2c1607]">{user?.tokens || 0} Tokens</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => scrollToSection("mentor-tokens-section")}
                    className="flex-1 sm:flex-none rounded-xl border-2 border-[#16629b] bg-white px-4 py-2.5 text-sm font-bold text-[#16629b] transition hover:bg-[#edf6fc]"
                  >
                    + Add Token
                  </button>
                  
                  {!isPremium ? (
                    <button
                      onClick={() => scrollToSection("expedition-plans")}
                      className="flex-1 sm:flex-none rounded-xl border-2 border-[#004b6f] bg-[#16629b] px-5 py-2.5 text-sm font-bold text-white shadow-[0_3px_0_#004b6f] transition hover:bg-[#1e6da6] active:translate-y-1 active:shadow-none"
                    >
                      Upgrade Plan
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </article>

          {/* =================================================
              Quote Bubble Chat (Typewriter Effect)
          ================================================== */}
          <div className="mb-12">
            <div className="relative rounded-2xl border-2 border-[#ecdcd1] bg-[#faf2ed] px-6 py-5 shadow-[4px_4px_0_#ecdcd1] sm:px-8">
              <p className="text-base italic leading-7 text-[#2c1607] sm:text-lg min-h-[56px] sm:min-h-[28px]">
                {quoteText}
                <span className="animate-pulse inline-block h-4 border-r-2 border-[#2c1607] ml-0.5 align-middle"></span>
              </p>
            </div>
          </div>

          {/* =================================================
              Backend loading error
          ================================================== */}
          {loadError ? (
            <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Unable to load shop</p>
                  <p className="mt-1 text-sm leading-6">{loadError}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRetry}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-300 bg-white px-4 font-semibold"
              >
                <RefreshCcw size={17} />
                Retry
              </button>
            </div>
          ) : null}

          {/* =================================================
              Shop Plans
          ================================================== */}
          <div id="expedition-plans">
            <div className="mb-8">
              <h2 className="text-2xl font-extrabold text-[#2c1607] sm:text-3xl">
                Choose Your Expedition
              </h2>
              <p className="mt-2 text-[#6b6670]">
                Unlock premium features and mentor tokens now!
              </p>
            </div>

            {/* =========================================
                PLANS FLEX CONTAINER (Horizontal Squish Effect)
            ========================================== */}
            {!isPremium ? (
              <div className="flex flex-col lg:flex-row items-stretch w-full gap-7">
                
                {/* Free Plan */}
                <article className="flex-1 w-full min-w-0 flex flex-col rounded-[28px] bg-[#8b5e3c] p-7 text-white shadow-sm sm:p-8 transition-all duration-500 ease-in-out hover:lg:flex-[1.15]">
                  <div className="mb-8">
                    <h3 className="text-3xl font-extrabold whitespace-nowrap">Free</h3>
                    <p className="mt-2 text-white/80">The Basic Foundation</p>
                  </div>
                  <div className="mb-9">
                    <span className="text-5xl font-extrabold">Rp0</span>
                  </div>
                  <ul className="mb-10 flex-1 space-y-4 text-sm leading-6 sm:text-base">
                    {getFeaturesForPlan("free").map((feature) => (
                      <FeatureItem key={feature.name} feature={feature} light={true} />
                    ))}
                  </ul>
                  <button
                    type="button"
                    disabled
                    className="min-h-14 mt-auto w-full cursor-default rounded-xl bg-[#bfa07f] px-5 font-bold text-[#463326] opacity-90"
                  >
                    Current Plan
                  </button>
                </article>

                {/* Premium Plans (Explorer & Conqueror) */}
                {staticPremiumPlans.map((plan) => (
                  <article
                    key={plan.id}
                    className="group relative flex-1 w-full min-w-0 flex flex-col rounded-[28px] border-2 border-[#16629b] bg-white p-7 shadow-[0_8px_24px_rgba(22,98,155,0.12)] transition-all duration-500 ease-in-out hover:shadow-xl hover:lg:flex-[1.4] hover:-translate-y-1 sm:p-8 overflow-hidden"
                  >
                    <span className="absolute right-5 top-5 rounded-full bg-[#16629b] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      Premium
                    </span>
                    
                    <div className="mb-7 pr-16">
                      <h3 className="text-2xl font-extrabold text-[#2c1607] sm:text-3xl whitespace-nowrap overflow-hidden text-ellipsis">
                        {plan.name}
                      </h3>
                      <p className="mt-2 text-sm font-semibold text-[#16629b] whitespace-nowrap">
                        {plan.tagline}
                      </p>
                    </div>

                    <div className="mb-8">
                      <span className="text-4xl font-extrabold text-[#2c1607] sm:text-5xl whitespace-nowrap overflow-hidden text-ellipsis">
                        {formatRupiah(plan.price)}
                      </span>
                    </div>

                    <ul className="mb-9 flex-1 space-y-4 text-sm leading-6 text-[#4c5159] sm:text-base">
                      {getFeaturesForPlan(plan.type).map((feature) => (
                        <FeatureItem key={feature.name} feature={feature} />
                      ))}
                    </ul>

                    {/* Accordion Expand on Hover (Vertical Text Reveal) */}
                    <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-in-out group-hover:grid-rows-[1fr]">
                      <div className="overflow-hidden">
                        <div className="pb-5 text-sm leading-6 text-[#6b6670] border-t border-gray-100 mt-2 pt-4 min-h-0">
                          <strong className="text-[#2c1607]">Best for:</strong> {plan.hoverDesc}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleChooseItem(plan.id)}
                      className="min-h-14 mt-auto w-full rounded-xl border-2 border-[#004b6f] bg-[#16629b] px-5 font-bold text-white shadow-[0_5px_0_#004b6f] transition hover:bg-[#1e6da6] active:translate-y-1 active:shadow-none"
                    >
                      Upgrade Plan
                    </button>
                  </article>
                ))}
              </div>
            ) : null}

            {/* =========================================
                Premium already active
            ========================================== */}
            {isPremium ? (
              <div className="mb-12 rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm leading-6 text-[#315b78]">
                Your Premium subscription is already active. Subscription products are hidden to avoid accidental duplicate purchases.
              </div>
            ) : null}

            {/* =========================================
                Mentor token packages
            ========================================== */}
            {tokenItems.length > 0 ? (
              <div id="mentor-tokens-section" className={!isPremium ? "mt-16" : ""}>
                <div className="mb-6">
                  <div className="flex items-center gap-3">
                    <Coins size={25} className="text-[#16629b]" />
                    <h3 className="text-2xl font-extrabold text-[#2c1607]">
                      Mentor Token Packs
                    </h3>
                  </div>
                  <p className="mt-2 text-[#6b6670]">
                    Add mentor consultation tokens to your account.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {tokenItems.map((item) => (
                    <article
                      key={item.id}
                      className="flex min-h-[320px] flex-col rounded-[24px] border border-[#ead3bd] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="mb-5 flex items-start justify-between gap-4">
                        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#fff0e7] text-[#16629b]">
                          <Package size={23} />
                        </div>
                        {item.token_reward > 0 ? (
                          <span className="rounded-full bg-[#eef7ff] px-3 py-1 text-xs font-bold text-[#16629b]">
                            +{item.token_reward} token{item.token_reward === 1 ? "" : "s"}
                          </span>
                        ) : null}
                      </div>

                      <h4 className="text-xl font-bold text-[#2c1607]">{item.name}</h4>
                      <p className="mt-2 flex-1 text-sm leading-6 text-[#6b6670]">
                        {item.description}
                      </p>

                      <ul className="mt-5 space-y-3 text-sm text-[#4c5159]">
                        {getTokenBenefits(item).map((benefit) => (
                          <FeatureItem
                            key={benefit}
                            feature={{ name: benefit, value: true }}
                          />
                        ))}
                      </ul>

                      <div className="mt-6 flex items-end justify-between gap-4">
                        <span className="text-2xl font-extrabold text-[#2c1607]">
                          {formatRupiah(item.price_rupiah)}
                        </span>
                        <button
                          type="button"
                          disabled={item.stock_quantity <= 0}
                          onClick={() => handleChooseItem(item.id)}
                          className="rounded-xl border-2 border-[#16629b] bg-white px-4 py-2.5 text-sm font-bold text-[#16629b] transition hover:bg-[#edf6fc] disabled:cursor-not-allowed disabled:border-[#cbd0d5] disabled:text-[#92979b]"
                        >
                          Buy
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </UserLayout>
  );
}