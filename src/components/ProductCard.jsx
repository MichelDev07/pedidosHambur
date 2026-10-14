import React from 'react';
import { Plus, Minus, Ticket, Check } from 'lucide-react';

export const ProductCard = ({ product, cartItem, onAddToCart, onUpdateQuantity }) => {
  const quantity = cartItem ? cartItem.cantidad : 0;

  return (
    <div className={`product-card ${product.popular ? 'featured' : ''}`}>
      {/* Badge destacado */}
      {product.badge && (
        <div className="product-badge-corner">
          {product.badge}
        </div>
      )}

      <div>
        <div className="product-header">
          <div className="product-emoji">
            {product.emoji || '🍔'}
          </div>
          <div className="product-title-area">
            <h3 className="product-title">{product.nombre}</h3>
            {product.numerosRifa > 0 && (
              <span className="product-raffle-tag">
                <Ticket size={12} />
                +{product.numerosRifa} {product.numerosRifa === 1 ? 'Número' : 'Números'} de Rifa
              </span>
            )}
          </div>
        </div>

        <p className="product-description">
          {product.descripcion}
        </p>
      </div>

      <div className="product-footer">
        <div className="product-price">
          <span>$</span>{product.precio.toLocaleString('es-AR')}
        </div>

        {quantity === 0 ? (
          <button 
            className="add-btn"
            onClick={() => onAddToCart(product)}
            aria-label={`Agregar ${product.nombre}`}
          >
            <Plus size={16} />
            <span>Agregar</span>
          </button>
        ) : (
          <div className="qty-control">
            <button 
              className="qty-btn"
              onClick={() => onUpdateQuantity(product.id, quantity - 1)}
              aria-label="Restar uno"
            >
              <Minus size={14} />
            </button>
            <span className="qty-number">{quantity}</span>
            <button 
              className="qty-btn"
              onClick={() => onUpdateQuantity(product.id, quantity + 1)}
              aria-label="Sumar uno"
            >
              <Plus size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
