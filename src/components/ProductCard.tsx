import React from 'react';
import './ProductCard.css';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  affiliateLink: string;
  platform: string;
  badge?: string | null;
  onCardClick: (productId: string, affiliateLink: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  description,
  price,
  image,
  affiliateLink,
  platform,
  badge,
  onCardClick,
}) => {
  const handleClick = () => {
    onCardClick(id, affiliateLink);
    window.open(affiliateLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="product-card" onClick={handleClick}>
      {badge && <div className="product-card__badge">{badge}</div>}

      <div className="product-card__image-wrapper">
        <img
          src={image}
          alt={name}
          className="product-card__image"
          loading="lazy"
        />
      </div>

      <div className="product-card__content">
        <h4 className="product-card__name">{name}</h4>
        <p className="product-card__description">{description}</p>

        <div className="product-card__footer">
          <span className="product-card__price">{price}</span>
          <span className="product-card__platform">{platform}</span>
        </div>
      </div>
    </div>
  );
};
