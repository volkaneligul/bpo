import React, { PropTypes } from 'react';
import ItemList from './ItemList';

const Cart = ({ cartData, handleUpdateItemClick, handleDeleteItemClick }) => {
  if(cartData[0].itemList.length > 0) {
    return (
      <div id="cart-container" className="content-holder group">
        <div className="upper-bar">
          <div id="error-message-container"></div>
        </div>
        <section className="checkout-content">
          <div className="box umbrella">
            <header className="group">
              <h1 className="cart-title">Sepetim</h1>
              <div className="cart-list-header group">
                <div className="col col2">ADET</div>
                <div className="col col3">FİYAT</div>
              </div>
            </header>
            <div className="cart-content group">
              <form id="form-item-list" method="POST" onSubmit={function(e){e.preventDefault() }}>
              <ItemList itemList={cartData[0].itemList}
                handleUpdateItemClick={handleUpdateItemClick}
                handleDeleteItemClick={handleDeleteItemClick} />
              </form>
              <a href="http://www.hepsiburada.com" className="btn btn-secondary btn-sm" data-bind="css: { 'btn-sm': !isMontageAvailable() }"><i className="arrow-icon"></i> Alışverişe Devam Et</a>
            </div>
          </div>
        </section>
        <aside id="sidebar" className="sidebar" role="complementary">
          <section className="box widget short-summary">
            <div id="short-summary" data-bind="template: { name: 'sidebar-tmpl' }">
              <div className="box-content">
                <h2>Sipariş Özeti</h2>
                <p className="quantity-detail">
                  <span data-bind="text: cartItemTotalQuantity">1 ürün</span>
                </p>
                <div className="total-amount">
                  <h4 className="sidebar-list-title">
                    Ödenecek Tutar
                  </h4>
                  <div className="total-price">
                    <span data-bind="text: totalPrice">2.376,15</span> TL
                  </div>
                </div>
                <div className="cart-proceed-container">
                  <button className="btn btn-primary full" data-bind="click: continueCheckout">
                  <span className="text">Alışverişi Tamamla</span>
                  <i className="icon-chevron-right"></i>
                  </button>
                  <div className="gifts-in-basket group">
                    <input id="has-gift-box" className="checkbox" data-bind="checked: isGiftBoxSelected" type="checkbox" />
                    <label for="has-gift-box">Hediye paketi istiyorum</label>
                  </div>
                </div>
              </div>
              <div id="item-prices" className="box-highlighted box-content">
                <div className="sidebar-list">
                  <div className="list-item">
                    <h3 className="sidebar-list-title">
                      Ürünler Toplamı (KDV Dahil)
                    </h3>
                    <div className="price">
                      <strong data-bind="text: cartItemPrice">2.368,99</strong> TL
                    </div>
                  </div>
                  <div className="list-item">
                    <h3 className="sidebar-list-title">
                      <i className="icon-info-sign tooltips" data-toggle="tooltip" title="" data-original-title="Seçtiğiniz kargo şirketi ve teslimat biçimine göre değişebilir."></i>
                      Kargo Ücreti
                    </h3>
                    <div className="price">
                      <strong data-bind="text: shippingPrice">7,16</strong> TL
                    </div>
                  </div>
                </div>
              </div>
              <div className="box-content">
                <a href="javascript://" className="link-type-one" data-bind="click: showGiftCerts">Çek / Promosyon Kodu Kullan</a>
              </div>
            </div>
          </section>
        </aside>
      </div>
    );
  } else {
    return (
      <div className="content-holder">
        <div className="box">
          <div className="box-content">
            <div className="empty-cart recommendation">
              <h1 className="h1">Sepetin şu an boş.</h1>
                <p>
                    Hepsiburada.com’da <strong>2.000.000</strong>'dan fazla ürün seni bekliyor.<br />
                    Dilersen aşağıdaki önerileri inceleyerek hemen alışverişe başlayabilirsin.
                </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Cart.propTypes = {
  cartData: PropTypes.array.isRequired
};

export default Cart;
