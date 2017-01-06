import React, { Component, PropTypes } from 'react';
import Cart from './Cart';
import { cartData } from '../../data/cart/getCart';
import { increaseCartData } from '../../data/cart/increaseCartData';
import { decreaseCartData } from '../../data/cart/decreaseCartData';
import { deleteCartData } from '../../data/cart/deleteCartData';

const CART_DATA = cartData;
let UPDATE_ITEM_CART_DATA = "";

class CartApp extends Component {
  constructor(props) {
    super();

    this.state = {
      cartData: CART_DATA
    };

    this.handleUpdateItemClick = this.handleUpdateItemClick.bind(this);
    this.handleDeleteItemClick = this.handleDeleteItemClick.bind(this);
  }

  handleUpdateItemClick(e) {
    const quantityChange = e.target.className;
    UPDATE_ITEM_CART_DATA = quantityChange === "increase" ? increaseCartData : decreaseCartData
    this.setState({
        cartData: UPDATE_ITEM_CART_DATA
      });
  }

  handleDeleteItemClick(e) {
    UPDATE_ITEM_CART_DATA = deleteCartData;
    this.setState({
        cartData: UPDATE_ITEM_CART_DATA
      });
  }

  render() {
    const { cartData } = this.state;
    return (
      <div>
        <Cart cartData = { cartData }
        handleUpdateItemClick={this.handleUpdateItemClick}
        handleDeleteItemClick={this.handleDeleteItemClick} />
      </div>
    );
  }
}

export default CartApp;
