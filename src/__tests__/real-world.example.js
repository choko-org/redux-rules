import test from 'tape'
import { createStore, applyMiddleware } from 'redux'
import combineRules, { every, notEvery } from '../index'

// Actions.

const CREATE_ORDER = 'shopping/CREATE_ORDER'
const createOrderAction = order => ({
  type: CREATE_ORDER,
  payload: { order }
})

const FLASH_MESSAGE = 'system/FLASH_MESSAGE'
const flashMessageAction = ({ text }) => ({
  type: FLASH_MESSAGE,
  payload: { text }
})

// Redux Reducers.
const mockReducerWithInitialState = (initialState = {}) => (state = initialState, action) => {
  if (action.type === CREATE_ORDER) {
    return { ...state, order: action.payload.order }
  }

  if (action.type === FLASH_MESSAGE) {
    const message = action.payload.text
    const messages = state.messages.concat(message)
    return { ...state, messages }
  }

  return state
}

// Discounts Rules.

const orderIsOnSummer = ({ action: { payload } }) => ['june', 'july', 'august']
  .some(month => month === payload.order.month)

const summerSpecialDiscountRule = {
  type: 'discounts/SUMMER_SPECIAL',
  actionTypes: [CREATE_ORDER],
  condition: orderIsOnSummer,
  reaction: (store) => next => action => {
    const nextResult = next(action)
    store.dispatch(flashMessageAction({
      text: 'You get 20% of discount, because is Summer!'
    }))
    return nextResult
  }
}

const customerIsVip = ({ state: { customer } }) => customer.roles
  .some(role => role === 'vip')
const customerIsAdmin = ({ state: { customer } }) => customer.roles
  .some(role => role === 'admin')

const vipCustomersDiscountRule = {
  type: 'discounts/VIP',
  actionTypes: [CREATE_ORDER],
  condition: every([
    ({ state }) => state.total > 100,
    notEvery([customerIsVip, customerIsAdmin]),
  ]),
  reaction: (store) => next => action => {
    const nextResult = next(action)
    store.dispatch(flashMessageAction({
      text: 'VIP gets 10% when total is up to $100 !'
    }))
    return nextResult
  }
}

test('Example: Shopping as an VIP customer in Summer', assert => {
  const initialState = {
    customer: { roles: ['vip', 'authenticated'] },
    order: {},
    purchases: [
      { item: 'gizmo', value: '20' },
      { item: 'widget', value: '120' },
    ],
    messages: [],
    total: 140,
  }

  const mockedReducer = mockReducerWithInitialState(initialState)

  // Combine Rules, into middlewares.

  const mockedMiddlewareWithRule = combineRules({
    rules: [vipCustomersDiscountRule, summerSpecialDiscountRule]
  })

  // Redux Store.

  const store = createStore(
    mockedReducer,
    applyMiddleware(mockedMiddlewareWithRule)
  )

  store.dispatch(createOrderAction({ month: 'august' }))
  assert.isEqual(store.getState().messages[0], 'You get 20% of discount, because is Summer!')
  assert.isEqual(store.getState().messages[1], 'VIP gets 10% when total is up to $100 !')

  assert.end()
})

test('Example: Shopping as an Admin customer in Summer', assert => {
  const initialState = {
    customer: { roles: ['vip', 'authenticated', 'admin'] },
    order: {},
    purchases: [
      { item: 'gizmo', value: '20' },
      { item: 'widget', value: '120' },
    ],
    messages: [],
    total: 140,
  }

  const mockedReducer = mockReducerWithInitialState(initialState)

  // Combine Rules, into middlewares.

  const mockedMiddlewareWithRule = combineRules({
    rules: [vipCustomersDiscountRule, summerSpecialDiscountRule]
  })

  // Redux Store.

  const store = createStore(
    mockedReducer,
    applyMiddleware(mockedMiddlewareWithRule)
  )

  store.dispatch(createOrderAction({ month: 'july' }))
  assert.isEqual(store.getState().messages.length, 1)
  assert.isEqual(store.getState().messages[0], 'You get 20% of discount, because is Summer!')

  assert.end()
})

test('Example: Shopping as an Vip customer not in Summer', assert => {
  const initialState = {
    customer: { roles: ['vip', 'authenticated', 'admin'] },
    order: {},
    purchases: [
      { item: 'gizmo', value: '20' },
      { item: 'widget', value: '40' },
    ],
    messages: [],
    total: 60,
  }

  const mockedReducer = mockReducerWithInitialState(initialState)

  // Combine Rules, into middlewares.

  const mockedMiddlewareWithRule = combineRules({
    rules: [vipCustomersDiscountRule, summerSpecialDiscountRule]
  })

  // Redux Store.

  const store = createStore(
    mockedReducer,
    applyMiddleware(mockedMiddlewareWithRule)
  )

  store.dispatch(createOrderAction({ month: 'april' }))
  assert.isNotEqual(store.getState().messages.length, 1)

  assert.end()
})
