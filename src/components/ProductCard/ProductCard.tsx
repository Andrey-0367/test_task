"use client";
import styles from "./ProductCard.module.scss";
import { Product } from "@/shared/types/products";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useCallback } from "react";

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
  onDelete?: (productId: number) => void;
  onEdit?: (productId: number) => void;
}

export function ProductCard({
  product,
  isFavorite: initialIsFavorite,
  onToggleFavorite,
  onDelete,
  onEdit,
}: ProductCardProps) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [localRating, setLocalRating] = useState(() => ({
    rate: product.rating?.rate || 0,
    count: (product.rating?.count || 0) + (initialIsFavorite ? 1 : 0),
  }));

  const handleFavoriteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const newIsFavorite = !isFavorite;
      
      setLocalRating((prev) => ({
        ...prev,
        count: newIsFavorite ? prev.count + 1 : Math.max(0, prev.count - 1),
      }));
      
      setIsFavorite(newIsFavorite);
      onToggleFavorite(product.id);
    },
    [isFavorite, onToggleFavorite, product.id]
  );

  const formatPrice = useCallback(() => {
    try {
      const priceValue =
        typeof product.price === "string"
          ? parseFloat(product.price.replace(/[^\d.]/g, ""))
          : Number(product.price);

      return isNaN(priceValue)
        ? `$${product.price}`
        : new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(priceValue);
    } catch {
      return `$${product.price}`;
    }
  }, [product.price]);

  const handleCardClick = useCallback(() => {
    sessionStorage.setItem(`product_${product.id}`, JSON.stringify(product));
    router.push(`/products/${product.id}`);
  }, [product, router]);

  const handleAction = useCallback(
    (e: React.MouseEvent, action: () => void) => {
      e.stopPropagation();
      action();
    },
    []
  );

  const renderRatingStars = useCallback(() => {
    const fullStars = Math.floor(localRating.rate);
    const hasHalfStar = localRating.rate % 1 >= 0.5;

    return (
      <>
        {"★".repeat(fullStars)}
        {hasHalfStar && "½"}
        {"☆".repeat(5 - fullStars - (hasHalfStar ? 1 : 0))}
      </>
    );
  }, [localRating.rate]);

  return (
    <article
      className={styles.card}
      onClick={handleCardClick}
      aria-labelledby={`product-title-${product.id}`}
      data-testid="product-card"
    >
      <div className={styles.imageContainer}>
        {product.image && !imageError ? (
          <Image
            src={product.image}
            alt={product.title}
            className={styles.productImage}
            width={200}
            height={200}
            onError={() => setImageError(true)}
            priority={false}
            unoptimized
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <span>No Image Available</span>
          </div>
        )}
      </div>

      <div className={styles.content}>
        <h3
          id={`product-title-${product.id}`}
          className={styles.title}
          title={product.title}
        >
          {product.title}
        </h3>

        <div className={styles.meta}>
          <span className={styles.price}>{formatPrice()}</span>
          {product.category && (
            <span className={styles.category} title={product.category}>
              {product.category}
            </span>
          )}
        </div>

        <div className={styles.rating} aria-label={`Rating: ${localRating.rate} out of 5`}>
          <span className={styles.stars}>{renderRatingStars()}</span>
          <span className={styles.reviews}>({localRating.count})</span>
        </div>

        {product.description && (
          <p className={styles.description}>
            {product.description.length > 100
              ? `${product.description.substring(0, 97)}...`
              : product.description}
          </p>
        )}

        <div className={styles.actions}>
          <button
            onClick={handleFavoriteClick}
            className={`${styles.actionButton} ${
              isFavorite ? styles.favoriteActive : ""
            }`}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavorite ? "❤️" : "🤍"}
          </button>

          {onEdit && (
            <button
              onClick={(e) => handleAction(e, () => onEdit(product.id))}
              className={styles.actionButton}
              aria-label={`Edit ${product.title}`}
            >
              ✏️
            </button>
          )}

          {onDelete && (
            <button
              onClick={(e) => handleAction(e, () => onDelete(product.id))}
              className={styles.actionButton}
              aria-label={`Delete ${product.title}`}
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    </article>
  );
}