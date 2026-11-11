
import { useEffect, useState, type FormEvent } from "react"
import {
  CheckCircle2,
  Loader2,
  Save,
  Building2,
  CreditCard,
  RefreshCw,
  ShieldCheck,
  Globe,
  Banknote,
  Share2,
} from "lucide-react"
import { supabase } from "../../../lib/supabase"
import { Button, Field, TextArea } from "../../../components/ui"

type SiteSettings = {
  business_name: string
  email: string
  whatsapp_number: string
  location: string
  instagram_url: string
  facebook_url: string
  youtube_url: string
  tiktok_url: string
  linkedin_url: string
  x_url: string
}

type PaymentSettings = {
  account_name: string
  bank_name: string
  account_ghs: string
  account_usd: string
  account_gbp: string
  account_eur: string
  paystack_url: string
  payment_instructions: string
}

const defaultSiteSettings: SiteSettings = {
  business_name: "Gong Management",
  email: "",
  whatsapp_number: "",
  location: "Tema, Greater Accra, Ghana",
  instagram_url: "",
  facebook_url: "",
  youtube_url: "",
  tiktok_url: "",
  linkedin_url: "",
  x_url: "",
}

const defaultPaymentSettings: PaymentSettings = {
  account_name: "Gong Managements",
  bank_name: "Guaranty Trust Bank (Ghana) Ltd (GT Bank)",
  account_ghs: "3219001001915",
  account_usd: "3219002004060",
  account_gbp: "",
  account_eur: "",
  paystack_url: "https://paystack.shop/pay/z44irmmv-s",
  payment_instructions: "",
}

export default function AdminSettingsPage() {
  const [siteSettings, setSiteSettings] =
    useState<SiteSettings>(defaultSiteSettings)

  const [paymentSettings, setPaymentSettings] =
    useState<PaymentSettings>(defaultPaymentSettings)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  const loadSettings = async () => {
    setLoading(true)
    setError("")
    setSaved(false)

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession()

      if (sessionError) throw sessionError

      if (!sessionData.session) {
        throw new Error("Please log in to access settings.")
      }

      const [siteResult, paymentResult] = await Promise.all([
        supabase
          .from("site_settings")
          .select("*")
          .eq("id", true)
          .single(),

        supabase
          .from("payment_settings")
          .select("*")
          .eq("id", true)
          .single(),
      ])

      if (siteResult.error) throw siteResult.error
      if (paymentResult.error) throw paymentResult.error

      setSiteSettings({
        business_name: siteResult.data.business_name || "",
        email: siteResult.data.email || "",
        whatsapp_number: siteResult.data.whatsapp_number || "",
        location: siteResult.data.location || "",
        instagram_url: siteResult.data.instagram_url || "",
        facebook_url: siteResult.data.facebook_url || "",
        youtube_url: siteResult.data.youtube_url || "",
        tiktok_url: siteResult.data.tiktok_url || "",
        linkedin_url: siteResult.data.linkedin_url || "",
        x_url: siteResult.data.x_url || "",
      })

      setPaymentSettings({
        account_name: paymentResult.data.account_name || "",
        bank_name: paymentResult.data.bank_name || "",
        account_ghs: paymentResult.data.account_ghs || "",
        account_usd: paymentResult.data.account_usd || "",
        account_gbp: paymentResult.data.account_gbp || "",
        account_eur: paymentResult.data.account_eur || "",
        paystack_url: paymentResult.data.paystack_url || "",
        payment_instructions:
          paymentResult.data.payment_instructions || "",
      })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load settings.",
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const updateSite = (
    key: keyof SiteSettings,
    value: string,
  ) => {
    setSiteSettings((current) => ({
      ...current,
      [key]: value,
    }))
    setSaved(false)
  }

  const updatePayment = (
    key: keyof PaymentSettings,
    value: string,
  ) => {
    setPaymentSettings((current) => ({
      ...current,
      [key]: value,
    }))
    setSaved(false)
  }

  const saveSettings = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    setSaving(true)
    setError("")
    setSaved(false)

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession()

      if (sessionError) throw sessionError

      if (!sessionData.session) {
        throw new Error(
          "Your session has expired. Please log in again.",
        )
      }

      const [siteResult, paymentResult] = await Promise.all([
        supabase
          .from("site_settings")
          .update({
            business_name: siteSettings.business_name.trim(),
            email: siteSettings.email.trim() || null,
            whatsapp_number:
              siteSettings.whatsapp_number.trim() || null,
            location: siteSettings.location.trim() || null,

            instagram_url:
              siteSettings.instagram_url.trim() || null,
            facebook_url:
              siteSettings.facebook_url.trim() || null,
            youtube_url:
              siteSettings.youtube_url.trim() || null,
            tiktok_url:
              siteSettings.tiktok_url.trim() || null,
            linkedin_url:
              siteSettings.linkedin_url.trim() || null,
            x_url:
              siteSettings.x_url.trim() || null,

            updated_at: new Date().toISOString(),
          })
          .eq("id", true),

        supabase
          .from("payment_settings")
          .update({
            account_name:
              paymentSettings.account_name.trim() || null,
            bank_name:
              paymentSettings.bank_name.trim() || null,
            account_ghs:
              paymentSettings.account_ghs.trim() || null,
            account_usd:
              paymentSettings.account_usd.trim() || null,
            account_gbp:
              paymentSettings.account_gbp.trim() || null,
            account_eur:
              paymentSettings.account_eur.trim() || null,
            paystack_url:
              paymentSettings.paystack_url.trim() || null,
            payment_instructions:
              paymentSettings.payment_instructions.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", true),
      ])

      if (siteResult.error) throw siteResult.error
      if (paymentResult.error) throw paymentResult.error

      setSaved(true)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save settings.",
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="admin-page !bg-[#090909] !text-[#f3f0e8]">
        <div className="flex min-h-[400px] items-center justify-center gap-3">
          <Loader2
            size={22}
            className="animate-spin text-[#d6aa33]"
          />
          <span className="text-sm text-white/60">
            Loading settings...
          </span>
        </div>
      </main>
    )
  }

  return (
    <main className="admin-page space-y-6 !bg-[#090909] !text-[#f3f0e8]">
      <div className="admin-title">
        <div>
          <span>Configuration</span>
          <h1>SITE SETTINGS</h1>
          <p>
            Manage business information, social media and customer
            payment instructions.
          </p>
        </div>

        <button
          type="button"
          onClick={loadSettings}
          disabled={saving}
          className="inline-flex items-center gap-2 border border-white/15 bg-[#151515] px-4 py-3 text-sm text-white transition hover:border-[#d6aa33] disabled:opacity-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="border border-red-400/30 bg-red-950/40 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {saved && (
        <div className="flex items-center gap-3 border border-green-400/20 bg-green-400/10 p-4 text-sm text-green-400">
          <CheckCircle2 size={19} />
          Settings saved successfully.
        </div>
      )}

      <form onSubmit={saveSettings} className="space-y-5">
        {/* BUSINESS CONTACT */}
        <section className="admin-panel space-y-5 !bg-[#151515] !text-[#f3f0e8]">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="bg-[#d6aa33]/10 p-3">
              <Building2 size={21} className="text-[#d6aa33]" />
            </div>

            <div>
              <h2 className="text-base font-semibold text-white">
                Business contact
              </h2>
              <p className="mt-1 text-xs text-white/40">
                Your company's public contact information.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Business name"
              value={siteSettings.business_name}
              onChange={(e) =>
                updateSite("business_name", e.target.value)
              }
            />

            <Field
              label="Email"
              type="email"
              value={siteSettings.email}
              placeholder="Business email address"
              onChange={(e) =>
                updateSite("email", e.target.value)
              }
            />

            <Field
              label="WhatsApp number"
              value={siteSettings.whatsapp_number}
              placeholder="+233..."
              onChange={(e) =>
                updateSite("whatsapp_number", e.target.value)
              }
            />

            <Field
              label="Location"
              value={siteSettings.location}
              placeholder="Business location"
              onChange={(e) =>
                updateSite("location", e.target.value)
              }
            />
          </div>
        </section>

        {/* SOCIAL MEDIA */}
        <section className="admin-panel space-y-5 !bg-[#151515] !text-[#f3f0e8]">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="bg-[#d6aa33]/10 p-3">
              <Share2 size={21} className="text-[#d6aa33]" />
            </div>

            <div>
              <h2 className="text-base font-semibold text-white">
                Social media links
              </h2>
              <p className="mt-1 text-xs text-white/40">
                Add your official social media profile URLs.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Instagram URL"
              value={siteSettings.instagram_url}
              placeholder="https://instagram.com/..."
              onChange={(e) =>
                updateSite("instagram_url", e.target.value)
              }
            />

            <Field
              label="Facebook URL"
              value={siteSettings.facebook_url}
              placeholder="https://facebook.com/..."
              onChange={(e) =>
                updateSite("facebook_url", e.target.value)
              }
            />

            <Field
              label="YouTube URL"
              value={siteSettings.youtube_url}
              placeholder="https://youtube.com/@..."
              onChange={(e) =>
                updateSite("youtube_url", e.target.value)
              }
            />

            <Field
              label="TikTok URL"
              value={siteSettings.tiktok_url}
              placeholder="https://tiktok.com/@..."
              onChange={(e) =>
                updateSite("tiktok_url", e.target.value)
              }
            />

            <Field
              label="LinkedIn URL"
              value={siteSettings.linkedin_url}
              placeholder="https://linkedin.com/company/..."
              onChange={(e) =>
                updateSite("linkedin_url", e.target.value)
              }
            />

            <Field
              label="X (Twitter) URL"
              value={siteSettings.x_url}
              placeholder="https://x.com/..."
              onChange={(e) =>
                updateSite("x_url", e.target.value)
              }
            />
          </div>

          <p className="text-xs leading-5 text-white/40">
            Leave any platform empty if Gong Management does not have
            an account on that platform. Empty links will not appear
            on the public website.
          </p>
        </section>

        {/* BANK DETAILS */}
        <section className="admin-panel space-y-5 !bg-[#151515] !text-[#f3f0e8]">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="bg-[#d6aa33]/10 p-3">
              <CreditCard size={21} className="text-[#d6aa33]" />
            </div>

            <div>
              <h2 className="text-base font-semibold text-white">
                Bank transfer details
              </h2>
              <p className="mt-1 text-xs text-white/40">
                Manage your bank account information for different currencies.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Bank name"
              value={paymentSettings.bank_name}
              placeholder="Bank name"
              onChange={(e) =>
                updatePayment("bank_name", e.target.value)
              }
            />

            <Field
              label="Account name"
              value={paymentSettings.account_name}
              placeholder="Account holder name"
              onChange={(e) =>
                updatePayment("account_name", e.target.value)
              }
            />
          </div>

          <div className="border-t border-white/10 pt-5">
            <div className="mb-4 flex items-center gap-2">
              <Banknote size={18} className="text-[#d6aa33]" />
              <h3 className="text-sm font-semibold text-white">
                Currency accounts
              </h3>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Ghana Cedi (GHS)"
                value={paymentSettings.account_ghs}
                placeholder="GHS account number"
                onChange={(e) =>
                  updatePayment("account_ghs", e.target.value)
                }
              />

              <Field
                label="US Dollar (USD)"
                value={paymentSettings.account_usd}
                placeholder="USD account number"
                onChange={(e) =>
                  updatePayment("account_usd", e.target.value)
                }
              />

              <Field
                label="British Pound (GBP)"
                value={paymentSettings.account_gbp}
                placeholder="GBP account number"
                onChange={(e) =>
                  updatePayment("account_gbp", e.target.value)
                }
              />

              <Field
                label="Euro (EUR)"
                value={paymentSettings.account_eur}
                placeholder="EUR account number"
                onChange={(e) =>
                  updatePayment("account_eur", e.target.value)
                }
              />
            </div>

            <p className="mt-4 text-xs text-white/40">
              Leave an account field empty if the banking details have
              not yet been provided.
            </p>
          </div>
        </section>

        {/* ONLINE PAYMENT */}
        <section className="admin-panel space-y-5 !bg-[#151515] !text-[#f3f0e8]">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="bg-[#d6aa33]/10 p-3">
              <Globe size={21} className="text-[#d6aa33]" />
            </div>

            <div>
              <h2 className="text-base font-semibold text-white">
                Online payment
              </h2>
              <p className="mt-1 text-xs text-white/40">
                Configure the online payment link customers will use.
              </p>
            </div>
          </div>

          <Field
            label="Paystack payment link"
            value={paymentSettings.paystack_url}
            placeholder="https://paystack.shop/pay/..."
            onChange={(e) =>
              updatePayment("paystack_url", e.target.value)
            }
          />

          {paymentSettings.paystack_url && (
            <a
              href={paymentSettings.paystack_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex text-sm font-semibold text-[#d6aa33] underline underline-offset-4"
            >
              Test Paystack payment link
            </a>
          )}
        </section>

        {/* PAYMENT INSTRUCTIONS */}
        <section className="admin-panel space-y-5 !bg-[#151515] !text-[#f3f0e8]">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="bg-[#d6aa33]/10 p-3">
              <ShieldCheck size={21} className="text-[#d6aa33]" />
            </div>

            <div>
              <h2 className="text-base font-semibold text-white">
                Payment instructions
              </h2>
              <p className="mt-1 text-xs text-white/40">
                Tell customers how to complete and confirm payments.
              </p>
            </div>
          </div>

          <TextArea
            label="Instructions"
            value={paymentSettings.payment_instructions}
            placeholder="Explain how customers should make payments and submit proof of payment."
            onChange={(e) =>
              updatePayment("payment_instructions", e.target.value)
            }
          />

          <div className="flex items-start gap-3 border border-amber-400/20 bg-amber-400/5 p-4">
            <ShieldCheck
              size={19}
              className="mt-0.5 shrink-0 text-[#d6aa33]"
            />
            <p className="text-xs leading-5 text-white/50">
              Confirm all banking information before making it
              available to customers. Payment settings are managed
              separately from public business contact information.
            </p>
          </div>
        </section>

        {/* SAVE */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            Changes are saved directly to your Supabase database.
          </p>

          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save settings
              </>
            )}
          </Button>
        </div>
      </form>
    </main>
  )
}
