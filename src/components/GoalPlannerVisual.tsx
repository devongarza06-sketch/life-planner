import React from "react";

export function SectionCard(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className = "", ...rest } = props;
  return <div className={`lp-card ${className}`} {...rest} />;
}

export function Hero(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className = "", ...rest } = props;
  return <div className={`lp-hero ${className}`} {...rest} />;
}

export function SectionTitle({title, subtitle}: {title: string, subtitle?: string}) {
  return (
    <div className="mb-3">
      <h2 className="text-lg md:text-xl font-semibold">{title}</h2>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}

export default {
  SectionCard,
  Hero,
  SectionTitle
}
