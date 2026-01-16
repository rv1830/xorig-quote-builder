export const PARTS_TEMPLATE = [
  "Processor", "Motherboard", "Graphics Card", "Power Supply", "RAM",
  "CPU Cooler", "SSD", "HDD", "Cabinet", "Monitor", "Keyboard",
  "Mouse", "Headset", "Additional Case Fans"
];

export const fmtINR = (n: number) => {
  const v = Number.isFinite(n) ? n : 0;
  return "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(v));
};

export const safeNum = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};