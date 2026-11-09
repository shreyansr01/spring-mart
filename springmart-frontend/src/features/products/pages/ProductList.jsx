import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiX } from "react-icons/fi";
import LoadingMessage from "../../../shared/components/LoadingMessage";
import { ErrorState } from "../../../shared/components/UIStates";
import styles from "../../../styles/components/ProductList.module.scss";
import { getProductsPage, searchProducts } from "../api";
import ProductCard from "../components/ProductCard";
import SkeletonCard from "../components/SkeletonCard";

const PAGE_SIZE = 12;
const MAX_RETRIES = 5;

function ProductList({ searchQuery = "", onClearSearch, imageVersion, refreshTrigger = 0 }) {
    const normalizedSearchQuery = useMemo(() => searchQuery.trim(), [searchQuery]);
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const retryTimerRef = useRef(null);

    useEffect(() => {
        return () => {
            if (retryTimerRef.current) {
                clearTimeout(retryTimerRef.current);
            }
        };
    }, []);

    const categories = useMemo(() => {
        if (!products || products.length === 0) return ["All"];
        const unique = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
        return ["All", ...unique];
    }, [products]);

    const filteredProducts = useMemo(() => {
        if (selectedCategory === "All") return products;
        return products.filter((p) => p.category?.toLowerCase() === selectedCategory.toLowerCase());
    }, [products, selectedCategory]);

    const loadProducts = useCallback(async (pageToLoad, replace = true, retryCount = 0) => {
        setLoading(true);
        setError(null);

        try {
            if (normalizedSearchQuery) {
                const matches = await searchProducts(normalizedSearchQuery);
                setProducts(matches);
                setHasMore(false);
                setLoading(false);
                return;
            }

            const response = await getProductsPage(pageToLoad, PAGE_SIZE);
            setProducts((currentProducts) => (replace ? response.items : [...currentProducts, ...response.items]));
            setHasMore(response.hasMore);
            setLoading(false);
        } catch (requestError) {
            if ((!requestError.status || requestError.status >= 500) && retryCount < MAX_RETRIES) {
                if (retryTimerRef.current) {
                    clearTimeout(retryTimerRef.current);
                }
                retryTimerRef.current = setTimeout(() => {
                    loadProducts(pageToLoad, replace, retryCount + 1);
                }, 8000);
            } else {
                const errorMessage = requestError?.message || "Could not load products. Please try again.";
                setError(errorMessage);
                if (replace) {
                    setProducts([]);
                }
                setLoading(false);
            }
        }
    }, [normalizedSearchQuery]);

    useEffect(() => {
        setPage(0);
        loadProducts(0, true);
    }, [loadProducts, refreshTrigger]);

    useEffect(() => {
        if (page > 0 && !normalizedSearchQuery) {
            loadProducts(page, false);
        }
    }, [loadProducts, normalizedSearchQuery, page]);

    const handleReload = useCallback(() => {
        setPage(0);
        loadProducts(0, true);
    }, [loadProducts]);

    if (loading && page === 0) {
        return (
            <div className={styles.productListContainer}>
                <h1 className={styles.pageTitle}>
                    {normalizedSearchQuery ? `Results for "${normalizedSearchQuery}"` : "All Products"}
                </h1>
                <div className={styles.loadingContainer}>
                    <LoadingMessage
                        message={normalizedSearchQuery ? `Searching for "${normalizedSearchQuery}"...` : "Connecting to server..."}
                        subtitle={normalizedSearchQuery ? "Looking for matching products..." : "The free server sleeps when idle. Please allow 1–2 minutes—it loads automatically."}
                        onRetry={handleReload}
                    />
                </div>
                <div className={styles.productGrid}>
                    {Array.from({ length: PAGE_SIZE }).map((_, index) => (
                        <SkeletonCard key={index} />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.productListContainer}>
                <h1 className={styles.pageTitle}>
                    {normalizedSearchQuery ? `Results for "${normalizedSearchQuery}"` : "All Products"}
                </h1>
                <ErrorState
                    title="Could not load products"
                    description={error}
                    onRetry={handleReload}
                />
            </div>
        );
    }

    if (filteredProducts.length === 0 && !loading) {
        return (
            <div className={styles.productListContainer}>
                {normalizedSearchQuery ? (
                    <div className={styles.headerContainer}>
                        <h1 className={styles.pageTitle}>
                            Results for "{normalizedSearchQuery}"
                        </h1>
                    </div>
                ) : (
                    <h1 className={styles.pageTitle}>All Products</h1>
                )}

                {categories.length > 1 && (
                    <div className={styles.categoryFilters} role="tablist" aria-label="Filter products by category">
                        {categories.map((category) => {
                            const isActive = selectedCategory.toLowerCase() === category.toLowerCase();
                            return (
                                <button
                                    key={category}
                                    type="button"
                                    role="tab"
                                    aria-selected={isActive}
                                    className={`${styles.filterPill} ${isActive ? styles.activePill : ""}`}
                                    onClick={() => setSelectedCategory(category)}
                                >
                                    {category}
                                </button>
                            );
                        })}
                    </div>
                )}

                <div className={styles.emptyState}>
                    {normalizedSearchQuery ? (
                        products.length > 0 ? (
                            <>
                                <h3>No results for "{normalizedSearchQuery}" in {selectedCategory}</h3>
                                <p>Found {products.length} match{products.length === 1 ? "" : "es"} in other categories.</p>
                                <div className={styles.emptyStateActions}>
                                    <button
                                        type="button"
                                        className={styles.primaryActionBtn}
                                        onClick={() => setSelectedCategory("All")}
                                    >
                                        View all categories ({products.length})
                                    </button>
                                    {onClearSearch && (
                                        <button
                                            type="button"
                                            className={styles.outlineActionBtn}
                                            onClick={onClearSearch}
                                        >
                                            Clear search
                                        </button>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <h3>No products found</h3>
                                <p>Nothing matched "{normalizedSearchQuery}". Try another search term.</p>
                                {onClearSearch && (
                                    <div className={styles.emptyStateActions}>
                                        <button
                                            type="button"
                                            className={styles.primaryActionBtn}
                                            onClick={onClearSearch}
                                        >
                                            Clear search
                                        </button>
                                    </div>
                                )}
                            </>
                        )
                    ) : (
                        <>
                            <h3>No products in {selectedCategory}</h3>
                            <p>Nothing has been added to this category yet.</p>
                            {selectedCategory !== "All" && (
                                <div className={styles.emptyStateActions}>
                                    <button
                                        type="button"
                                        className={styles.primaryActionBtn}
                                        onClick={() => setSelectedCategory("All")}
                                    >
                                        Show all categories
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={styles.productListContainer}>
            {normalizedSearchQuery ? (
                <div className={styles.headerContainer}>
                    <h1 className={styles.pageTitle}>
                        Results for "{normalizedSearchQuery}"
                    </h1>
                    {onClearSearch && (
                        <button
                            type="button"
                            className={styles.clearSearchBtn}
                            onClick={onClearSearch}
                            title="Clear search"
                        >
                            Clear search <FiX />
                        </button>
                    )}
                </div>
            ) : (
                <h1 className={styles.pageTitle}>All Products</h1>
            )}

            {!loading && !error && categories.length > 1 && (
                <div className={styles.categoryFilters} role="tablist" aria-label="Filter products by category">
                    {categories.map((category) => {
                        const isActive = selectedCategory.toLowerCase() === category.toLowerCase();
                        return (
                            <button
                                key={category}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                className={`${styles.filterPill} ${isActive ? styles.activePill : ""}`}
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                            </button>
                        );
                    })}
                </div>
            )}

            {loading && page > 0 && (
                <div className={styles.loadingContainer}>
                    <LoadingMessage message="Loading more products..." onRetry={() => loadProducts(page, false)} />
                </div>
            )}
            <div className={styles.productGrid}>
                {filteredProducts.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        imageVersion={imageVersion}
                        onProductDelete={handleReload}
                    />
                ))}
            </div>
            {!normalizedSearchQuery && selectedCategory === "All" && hasMore && !loading && (
                <div className={styles.loadMoreContainer}>
                    <button onClick={() => setPage((currentPage) => currentPage + 1)} className={styles.loadMoreButton}>
                        Load more
                    </button>
                </div>
            )}
            {loading && page > 0 && (
                <div className={styles.productGrid}>
                    {Array.from({ length: 6 }).map((_, index) => (
                        <SkeletonCard key={index} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default ProductList;
