import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react"
import { Link } from "react-router"
import { ArrowUpRight } from "lucide-react"

export function Eyebrow({
  children,
  dark = false,
}: {
  children: ReactNode
  dark?: boolean
}) {
  return (
    <p className={`eyebrow ${dark ? "text-black" : "text-gold"}`}>{children}</p>
  )
}

export function Heading({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return <h2 className={`display ${className}`}>{children}</h2>
}

export function ButtonLink({
  to,
  children,
  secondary = false,
  className = "",
}: {
  to: string
  children: ReactNode
  secondary?: boolean
  className?: string
}) {
  return (
    <Link
      className={`button ${secondary ? "button-secondary" : ""} ${className}`}
      to={to}
    >
      {children}
      <ArrowUpRight size={17} />
    </Link>
  )
}

export function Button({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`button ${className}`} {...props}>
      {children}
    </button>
  )
}

export function Field({
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input {...props} />
    </label>
  )
}

export function TextArea({
  label,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea rows={5} {...props} />
    </label>
  )
}

export function Select({
  label,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  children: ReactNode
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <select {...props}>{children}</select>
    </label>
  )
}

export function Status({ children }: { children: ReactNode }) {
  return (
    <span className="status">
      <span />
      {children}
    </span>
  )
}

export function PageHero({
  eyebrow,
  title,
  copy,
  image,
}: {
  eyebrow: string
  title: string
  copy: string
  image?: string
}) {
  return (
    <section
      className={`page-hero ${image ? "has-image" : ""}`}
      style={
        image
          ? {
              backgroundImage: `linear-gradient(90deg,rgba(8,8,8,.95),rgba(8,8,8,.2)),url(${image})`,
            }
          : undefined
      }
    >
      <div className="shell page-hero-inner">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="display">{title}</h1>
        <p>{copy}</p>
      </div>
    </section>
  )
}
