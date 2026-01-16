export interface Part {
  category: string;
  model: string;
  qty: number;
  rate: number;
}

export interface QuoteState {
  quoteNo: string;
  quoteDate: string;
  validTill: string;
  buildName: string;
  customer: { name: string; phone: string };
  imageUrl: string;
  discountType: "amount" | "percent" | "";
  discountValue: number;
  gstType: "amount" | "percent" | "";
  gstValue: number;
  parts: Part[];
}