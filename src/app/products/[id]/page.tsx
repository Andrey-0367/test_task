"use client";

import { use } from 'react';
import { useRouter } from "next/navigation";
import { useGetProductByIdQuery } from "@/features/products/api/productsApi";
import styles from "./page.module.scss";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params); 
  const productId = Number(resolvedParams.id);
  const {
    data: product,
    isLoading,
    isError,
  } = useGetProductByIdQuery(productId);

  if (isLoading) {
    return <div className={styles.loading}>Loading product...</div>;
  }

  if (isError) {
    return (
      <div className={styles.error}>
        <p>Error loading product</p>
        <button onClick={() => router.push("/products")}>
          Back to products
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.notFound}>
        <p>Product not found</p>
        <button onClick={() => router.push("/products")}>
          Back to products
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <button
        onClick={() => router.push("/products")}
        className={styles.backButton}
      >
        ← Back to products
      </button>

      <div className={styles.productContainer}>
        <div className={styles.imageContainer}>
          <img
            src={product.image}
            alt={product.title}
            width={400}
            height={400}
            className={styles.productImage}
          />
        </div>

        <div className={styles.productInfo}>
          <h1>{product.title}</h1>
          <p className={styles.price}>${product.price}</p>
          <p className={styles.category}>{product.category}</p>
          <p className={styles.description}>{product.description}</p>

          <div className={styles.rating}>
            Rating: {product.rating?.rate} ({product.rating?.count} reviews)
          </div>
        </div>
      </div>
    </div>
  );
}