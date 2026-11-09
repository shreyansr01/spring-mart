import React, { useEffect, useRef, useState } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import styles from "../../../styles/components/ProductCard.module.scss";
import ConfirmationModal from "../../../shared/components/ConfirmationModal";
import { showErrorToast, showSuccessToast } from "../../../shared/toast";
import { deleteProduct, getProductImageUrl } from "../api";
import { toBoolean } from "../form-utils";

function ProductCard({ product, imageVersion, onProductDelete }) {
    const { id, name, brand, price, inStock: rawInStock, category } = product;
    const inStock = toBoolean(rawInStock);
    const navigate = useNavigate();
    const formattedPrice = new Intl.NumberFormat("en-IN").format(Number(price) || 0);

    const cardRef = useRef(null);
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const imageUrl = getProductImageUrl(id, imageVersion);

    useEffect(() => {
        setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
    }, []);

    function handleTouchStart() {
        if (!isTouchDevice || !cardRef.current) {
            return;
        }

        cardRef.current.classList.add(styles.touchHover);

        setTimeout(() => {
            if (cardRef.current) {
                cardRef.current.classList.remove(styles.touchHover);
            }
        }, 3000);
    }

    function handleImageError(event) {
        event.target.onerror = null;
        event.target.src = "/no_image.jpg";
    }

    async function handleConfirmDelete() {
        setIsDeleting(true);

        try {
            const status = await deleteProduct(id);

            if (status === 204) {
                showSuccessToast("Product deleted");
                onProductDelete?.();
            } else if (status === 404) {
                showErrorToast("Product not found.");
            } else {
                showErrorToast("Could not delete product.");
            }
        } catch {
            showErrorToast("Could not delete product. Please try again.");
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    }

    return (
        <>
            <div className={styles.productCard} ref={cardRef} onTouchStart={handleTouchStart}>
                <div className={styles.imageContainer}>
                    <img
                        src={imageUrl}
                        alt={name}
                        className={styles.productImage}
                        onError={handleImageError}
                        loading="lazy"
                    />
                    <div className={styles.floatingActions}>
                        <button
                            type="button"
                            className={`${styles.actionBtn} ${styles.editBtn}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/edit/${id}`);
                            }}
                            title="Edit product"
                            aria-label={`Edit ${name}`}
                        >
                            <FiEdit />
                        </button>
                        <button
                            type="button"
                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowDeleteModal(true);
                            }}
                            title="Delete product"
                            aria-label={`Delete ${name}`}
                        >
                            <FiTrash2 />
                        </button>
                    </div>
                </div>
                <div className={styles.productDetails}>
                    <div className={styles.metaInfo}>
                        <span className={styles.brand} title={brand}>
                            {brand}
                        </span>
                        <span className={styles.separator}>/</span>
                        <span className={styles.category} title={category}>
                            {category}
                        </span>
                    </div>
                    <h3 className={styles.productTitle} title={name}>{name}</h3>
                    <div className={styles.priceRow}>
                        <span className={styles.price} title={`₹${formattedPrice}`}>₹{formattedPrice}</span>
                        <span className={`${styles.stockBadge} ${inStock ? styles.inStock : styles.outOfStock}`}>
                            <span className={styles.stockDot}></span>
                            {inStock ? "In stock" : "Out of stock"}
                        </span>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleConfirmDelete}
                title="Delete product"
                message={`Are you sure you want to delete "${name}"? This cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
                loading={isDeleting}
            />
        </>
    );
}

export default ProductCard;
