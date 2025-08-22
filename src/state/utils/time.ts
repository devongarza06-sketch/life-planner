export const pad2 = (n:number) => String(n).padStart(2, "0");

export const timeToMin = (t:string) => {
  const [h,m] = t.split(":").map((x)=>parseInt(x,10));
  return (isFinite(h)?h:0)*60 + (isFinite(m)?m:0);
};

export const minToTime = (m:number) => {
  const mm = ((m % (24*60)) + 24*60) % (24*60);
  const h = Math.floor(mm/60); const m2 = mm%60;
  return `${pad2(h)}:${pad2(m2)}`;
};

// week key helper (ISO-ish)
export function getWeekKey(d = new Date()): string {
  const dt = new Date(d);
  const onejan = new Date(dt.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((dt.getTime() - onejan.getTime()) / 86400000) + 1;
  const week = Math.ceil((dayOfYear + ((onejan.getDay() + 6) % 7)) / 7);
  return `${dt.getFullYear()}-${String(week).padStart(2, "0")}`;
}

/** Simple add-days returning ISO date (yyyy-mm-dd) */
export function addDaysISO(iso:string, days:number): string {
  const [y,m,d] = iso.split("-").map(n=>parseInt(n,10));
  const dt = new Date(y, (m-1), d);
  dt.setDate(dt.getDate()+days);
  return `${dt.getFullYear()}-${pad2(dt.getMonth()+1)}-${pad2(dt.getDate())}`;
}
export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
}
export function daysBetween(aISO:string, bISO:string): number {
  const [ya,ma,da] = aISO.split("-").map(n=>parseInt(n,10));
  const [yb,mb,db] = bISO.split("-").map(n=>parseInt(n,10));
  const a = new Date(ya,ma-1,da); a.setHours(0,0,0,0);
  const b = new Date(yb,mb-1,db); b.setHours(0,0,0,0);
  return Math.round((b.getTime()-a.getTime())/86400000);
}

// allow up to 24h (1440m)
export const clamp1to1440 = (n:number) => Math.max(1, Math.min(1440, Math.round(n)));
