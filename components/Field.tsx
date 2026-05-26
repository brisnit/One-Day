"use client";

import { ReactNode } from "react";

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
}

export function Field({ label, hint, error, htmlFor, children }: FieldProps) {
  return (
    <div className="mb-5">
      <label htmlFor={htmlFor} className="label-base">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-2 text-xs text-ink/50">{hint}</p>}
      {error && <p className="mt-2 text-xs text-coral font-medium">{error}</p>}
    </div>
  );
}

export function CurrencyInput(props: {
  id?: string;
  value: number | "";
  onChange: (v: number | "") => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 font-display text-xl font-bold text-ink/40">$</span>
      <input
        id={props.id}
        type="number"
        inputMode="decimal"
        min={0}
        step={100}
        placeholder={props.placeholder ?? "0"}
        value={props.value}
        onChange={(e) => {
          const v = e.target.value;
          props.onChange(v === "" ? "" : Number(v));
        }}
        className="input-base pl-10 text-lg font-medium"
      />
    </div>
  );
}

export function NumberInput(props: {
  id?: string;
  value: number | "";
  onChange: (v: number | "") => void;
  placeholder?: string;
  suffix?: string;
}) {
  return (
    <div className="relative">
      <input
        id={props.id}
        type="number"
        inputMode="numeric"
        min={0}
        value={props.value}
        onChange={(e) => {
          const v = e.target.value;
          props.onChange(v === "" ? "" : Number(v));
        }}
        placeholder={props.placeholder}
        className={`input-base ${props.suffix ? "pr-20" : ""}`}
      />
      {props.suffix && (
        <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 font-sans text-sm text-ink/50">
          {props.suffix}
        </span>
      )}
    </div>
  );
}

export function Select<T extends string>(props: {
  id?: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        id={props.id}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value as T)}
        className="input-base appearance-none pr-12 text-base font-medium"
      >
        {props.options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-ink/40">▾</span>
    </div>
  );
}

export function Toggle(props: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => props.onChange(!props.checked)}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-muted-soft bg-white px-5 py-4 text-left transition hover:border-ink/30"
    >
      <div>
        <p className="font-display font-bold text-ink">{props.label}</p>
        {props.description && <p className="text-xs text-ink/50 mt-0.5">{props.description}</p>}
      </div>
      <span
        className={`relative h-7 w-12 rounded-full transition ${props.checked ? "bg-amber" : "bg-muted-soft"}`}
        aria-hidden
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
            props.checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}
