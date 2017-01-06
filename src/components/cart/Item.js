import React, { PropTypes } from 'react';

const Item = ({ item, handleUpdateItemClick, handleDeleteItemClick }) => {
  return (
    <li className="item">
      <div className="item-content">
        <figure className="product-image">
          <a href={ item.productPageUrl }>
          <img src={ item.productImageUrl } alt={ item.detail.properties.name } title={ item.detail.properties.name } width="80" height="80" />
          </a>
        </figure>
        <div className="product-detail">
          <h4 className="product-name">
            <a href={ item.productPageUrl }> { item.detail.properties.name } </a>
          </h4>
          <div className="merchant">
            Satıcı:
            <a href={item.detail.properties.merchantUrl ? item.detail.properties.merchantUrl : "http://www.hepsiburada.com"}> { item.detail.properties.merchantName ?
               item.detail.properties.merchantName : "Hepsiburada"} </a>
          </div>
          <div className="campaign-list">
            {(() => {
              if (item.detail.properties.estimatedShippingValueCart) {
                return (
                  <div className="list-item">
                    <i className="icon-time"></i>
                    <span className="text" data-bind="text: estimatedTime">Bugün kargoda</span>
                  </div>
                );
              }
            })()}
          </div>
          <div className="utils">
            <a className="btn-delete" href="javascript://" onClick={handleDeleteItemClick}>Sil</a>
          </div>
        </div>
        <div className="quantity-wrapper">
          <div className="input-group">
            <button className="decrease" title="Azalt" onClick={handleUpdateItemClick}>
            <span>Azalt</span>
            </button>
            <input name="quantity" className="quantity" disabled={item.quantityFixed} value={item.quantity} maxlength="3" type="number" />
            <button className="increase" title="Arttır" onClick={handleUpdateItemClick}>
            <span>Arttır</span>
            </button>
          </div>
        </div>
        <div className="product-prices-utils">
          <div className="price">
            <span>{item.price}</span>
          </div>
          {(() => {
            if(!item.detail.properties.freeShipment) {
              return (
                <div className="list-item not-free-shipping">
                  <span className="text">+ Kargo Ücreti</span>
                </div>
              );
            } else {
              return (
                <div className="list-item free-shipping">
                  <span className="text">Kargo Bedava</span>
                </div>
              );
            }
          }
          )()}
        </div>
      </div>
    </li>
  );
}

Item.propTypes = {
  item: PropTypes.string.isRequired
};

export default Item;
