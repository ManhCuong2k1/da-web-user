import { createStore, combineReducers } from 'redux';

const initialCartState = {
    items: [],
    total: 0,
};

function cartReducer(state = initialCartState, action) {
    switch (action.type) {
        case 'SET_CART':
            return {
                ...state,
                items: action.payload.items,
                total: action.payload.total,
            };
        case 'CLEAR_CART':
            return {
                ...state,
                items: [],
                total: 0,
            };
        default:
            return state;
    }
}

export const updateCart = (payload) => ({ type: 'SET_CART', payload });
export const clearCart = () => ({ type: 'CLEAR_CART' });

const rootReducer = combineReducers({
    cart: cartReducer,
});

const store = createStore(rootReducer);

export default store;
