import { Product } from "@/shared/types/products";
import ProductPageClient from "./ProductPageClient";

export async function generateStaticParams() {
  const products = await fetch('https://api.example.com/products').then(res => res.json());
  return products.map((product: Product) => ({
    id: product.id.toString()
  }));
}

export default function Page({ params }: { params: { id: string } }) {
  return <ProductPageClient id={params.id} />;
}
