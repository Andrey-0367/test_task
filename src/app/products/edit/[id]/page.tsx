import { Metadata } from "next";
import EditProductPage from "./EditPageClient";


interface PageProps {
  params: Promise<{ id: string }>;
}

const mockProducts = Array.from({ length: 19 }, (_, i) => ({ id: i + 1 }));

export async function generateStaticParams() {
  return mockProducts.map((product) => ({
    id: product.id.toString(),
  }));
}

export const metadata: Metadata = {
  title: 'Product Details',
  description: 'Detailed product information',
};

export default async function Page(props: PageProps) {
  const { id } = await props.params;
  return <EditProductPage id={id} />;
}