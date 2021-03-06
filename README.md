# Rules API for [Redux](http://redux.js.org)
Make your code more easy to reason about with a more **natural language for your
logic**, using rules fired by actions and reacting to a given set of facts.

Based on the forward-chaining rules in Clojure called [Clara](https://github.com/rbrush/clara-rules) and a discussion from an [issue](https://github.com/choko-org/choko-core/issues/1)
of Choko core.

[![Build Status](https://travis-ci.org/choko-org/redux-boot.svg?branch=master)](https://travis-ci.org/choko-org/redux-boot)


### Where Redux gets in?
```
[ACTION] => ([RULES] -> [CONDITIONS] -> [REACTIONS]) => [STATE]
```
*Obs.: Reactions are dispatched actions / side-effects.*

Redux gives us the tools to build functional rules systems using it's middleware API.
So basically each rule behaves like a Redux's middleware.

## Vanilla Redux:
```js
import { createStore, applyMiddleware} from 'redux'
import { flashMessage, FLASH_MESSAGE } from 'app/modules/messages/actions'

const LOGIN_SUCCESS = 'user/login/SUCCESS'

const welcomeAuthUserMiddleware = store => next => action => {
  switch (action.type) {
    case LOGIN_SUCCESS:
      if (action.payload.user.roles.some(role => role === 'authenticated')) {
        const { name, lastLogin } = action.payload.user
        if (!!lastLogin) {
          store.dispatch(flashMessage('Good to see you ' + name + '!'))
        }
      }
      break;
  }
  return next(action)
}

const reducer = (state, action) => {
  if (action.type === LOGIN_SUCCESS) {
    return { ...state, user: action.payload.user }
  }

  if (action.type === FLASH_MESSAGE) {
    return { ...state, message: action.payload }
  }
}

const store = createStore(reducer, applyMiddleware(welcomeAuthUserMiddleware))

store.dispatch({
  type: LOGIN_SUCCESS,
  payload: { user: { name: 'Manolo', roles: ['authenticated'] } }
})

console.log(getState().message) // Good to see you Manolo!
```

## Using Redux Rules:
```js
import { createStore, applyMiddleware } from 'redux'
import combineRules, { every } from 'redux-rules'
import { flashMessage, FLASH_MESSAGE } from 'app/modules/messages/actions'

const LOGIN_SUCCESS = 'user/login/SUCCESS'

const isAuthUser = ({ action }) => action.payload
  .user.roles.some(role => role === 'authenticated')
const isComingBackUser = ({ action }) => !!action.payload.user.lastLogin

const welcomeAuthUserMessageRule = {
  type: 'messages/user/login/SUCCESS',
  actionTypes: [LOGIN_SUCCESS],
  condition: every([
    isAuthUser, isComingBackUser
  ]),
  reaction: store => next => action => {
    const { name } = action.payload.user
    store.dispatch(flashMessage('Good to see you ' + name + '!'))
    return next(action)
  }
}

const rulesMiddleware = combineRules({
  rules: [welcomeAuthUserMessageRule]
})

const reducer = (state, action) => {
  if (action.type === LOGIN_SUCCESS) {
    return { ...state, user: action.payload.user }
  }

  if (action.type === FLASH_MESSAGE) {
    return { ...state, message: action.payload }
  }
}

const store = createStore(reducer, applyMiddleware(rulesMiddleware))

store.dispatch({
  type: LOGIN_SUCCESS,
  payload: { user: { name: 'Manolo', roles: ['authenticated'] } }
})

console.log(getState().message) // Good to see you Manolo!
```

## Usage:
- [Tests](https://github.com/choko-org/redux-rules/tree/master/src/__tests__).
- [Real World](https://github.com/choko-org/redux-rules/blob/master/src/__tests__/real-world.example.js).
- Docs coming soon...

# LICENSE
[MIT](LICENSE.md)
