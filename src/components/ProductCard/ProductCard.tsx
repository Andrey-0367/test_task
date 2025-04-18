"use client";
import styles from "./ProductCard.module.scss";
import Image from "next/image";
import { Product } from "@/shared/types/products";
import { useRouter } from "next/navigation";

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
}

export function ProductCard({
  product,
  isFavorite,
  onToggleFavorite,
  onDelete,
}: ProductCardProps) {
  const router = useRouter();
  const rating = product.rating || { rate: 0, count: 0 };

  const handleCardClick = () => {
    router.push(`/products/${product.id}`);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className={styles.card} onClick={handleCardClick}>
      <div className={styles.imageContainer}>
        <img
          src={product.image}
          alt={product.title}
          className={styles.productImage}
        />
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{product.title}</h3>

        <div className={styles.meta}>
          <span className={styles.price}>${product.price.toFixed(2)}</span>
          <span className={styles.category}>{product.category}</span>
        </div>

        <div className={styles.rating}>
          <span className={styles.stars}>
            {"★".repeat(Math.round(rating.rate))}
            {"☆".repeat(5 - Math.round(rating.rate))}
          </span>
          <span>({rating.count} reviews)</span>
        </div>
        <div className={styles.cardDescription}>
          <p>{product.description}</p>
        </div>

        <div className={styles.actions} onClick={handleActionClick}>
          <button
            onClick={onToggleFavorite}
            className={`${styles.favoriteButton} ${
              isFavorite ? styles.active : ""
            }`}
            aria-label={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
          >
            {isFavorite ? "❤️" : "🤍"}
          </button>

          {onDelete && (
            <button
              onClick={onDelete}
              className={styles.deleteButton}
              aria-label="Delete product"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    </div>
  );
}