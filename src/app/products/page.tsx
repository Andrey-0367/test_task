'use client';

import Link from 'next/link';
import styles from './page.module.scss';
import { ProductsList } from '@/components/ProductsList/ProductsList';


export default function ProductsPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Продукция</h1>
        <Link href="/create-product" className={styles.addButton}>
        + Добавить товар
        </Link>
      </div>
      <ProductsList />
    </div>
  );
}

