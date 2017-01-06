import React, { PropTypes } from 'react';
import Item from './Item';

const ItemList = ({ itemList, handleUpdateItemClick, handleDeleteItemClick }) => {
  return (
    <div className="item-list">
      {itemList.map(item => {
        return (
          <ul className="cart-item-list">
          <Item
            item={item}
            handleUpdateItemClick={handleUpdateItemClick}
            handleDeleteItemClick={handleDeleteItemClick}
          /></ul>
        );
      })}
    </div>
  );
}

ItemList.propTypes = {
  itemList: PropTypes.array.isRequired
};

export default ItemList;
