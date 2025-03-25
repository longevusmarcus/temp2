export interface PixelBlock {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  projectName: string;
  developerName: string;
  description: string;
  thumbnailUrl: string;
  websiteUrl: string;
  color: string;
  category: string;
  email?: string;
}

export interface PurchaseData {
  blockSize: string;
  locations: Array<{ x: number; y: number }>;
  projectDetails: {
    projectName: string;
    developerName: string;
    description: string;
    websiteUrl: string;
    thumbnail: File | null;
    category: string;
    email: string;
  };
}

// Add Location type export
export type Location = { x: number; y: number };

// Add BlockSize type export
export type BlockSize = "small" | "medium" | "large";

export interface ProjectDetails {
  name: string;
  description: string;
  contactEmail: string;
  website: string;
  image: File | null;
  category: string;
}

export interface BlockSizeInfo {
  width: number;
  height: number;
  label: string;
  price: number;
}

export const BLOCK_SIZES: Record<
  string,
  BlockSizeInfo & { price_id?: string; product_id?: string }
> = {
  small: {
    width: 10,
    height: 10,
    label: "10×10",
    price: 10,
    price_id: "afc4fdfb-a692-4bbd-be05-37fd5ab3891c",
    product_id: "small-pixel-block",
  },
  medium: {
    width: 20,
    height: 20,
    label: "20×20",
    price: 35,
    price_id: "9ac26644-0e8c-4b98-9252-557c4289d4b0",
    product_id: "medium-pixel-block",
  },
  large: {
    width: 50,
    height: 50,
    label: "50×50",
    price: 200,
    price_id: "09855163-acad-478f-b537-4de9c1c7eb14",
    product_id: "large-pixel-block",
  },
};

export interface PaymentSession {
  id: string;
  url: string;
  status: "pending" | "completed" | "failed";
  amount: number;
  currency: string;
  metadata: Record<string, any>;
  created_at: string;
}
