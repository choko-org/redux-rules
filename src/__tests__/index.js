import test from 'tape'
import { createStore, applyMiddleware } from 'redux'
import insertRules from '../index'

test('Rules should have a basic structure', assert => {
  const LOGIN_SUCCESS = 'users/login/SUCESS'
  const WELCOME_MESSAGE = 'users/login/WELCOME_MESSAGE'

  const welcomeMessageRule = {
    type: WELCOME_MESSAGE,
    actionTypes: [ LOGIN_SUCCESS ],
    condition: facts => true,
    reaction: store => next => action => next(action)
  }

  const { condition, ...ruleWithoutCondition } = welcomeMessageRule
  assert.throws(
    () => insertRules({ rules: [ruleWithoutCondition] }),
    /WELCOME_MESSAGE/
  )
  assert.end()
})

test('Rules should react and dispatch a new action', assert => {

  const LOGIN_SUCCESS = 'users/login/SUCESS'
  const FLASH_MESSAGE = 'system/FLASH_MESSAGE'
  const WELCOME_MESSAGE = 'users/login/WELCOME_MESSAGE'

  const userIsAdminCondition = facts => facts.action.payload
    .user.roles.some(role => role === 'admin')

  const welcomeMessageRule = {
    type: WELCOME_MESSAGE,
    actionTypes: [ LOGIN_SUCCESS ],
    condition: userIsAdminCondition,
    reaction: ({ getState, dispatch }) => next => action => {
      const nextResult = next(action)

      const userName = getState().user.name

      dispatch({
        type: FLASH_MESSAGE,
        payload: 'Hello ' + userName + '!'
      })

      return nextResult
    }
  }

  // Here's the magic.
  const mockMiddlewareWithRule = insertRules({ rules: [welcomeMessageRule] })

  const mockMiddlewares = [mockMiddlewareWithRule]

  // @TODO: Create a redux store with the middleware.
  const reducer = (state = {}, action) => {
    if (action.type === LOGIN_SUCCESS) {
      return { ...state, user: action.payload.user }
    }

    if (action.type === FLASH_MESSAGE) {
      return { ...state, message: action.payload }
    }

    return state
  }

  const store = createStore(
    reducer,
    applyMiddleware(...mockMiddlewares)
  )

  store.dispatch({
    type: LOGIN_SUCCESS,
    payload: { user: {
      name: 'Manolo',
      roles: ['admin', 'authenticated']
    } }
  })

  assert.isEqual(store.getState().message, 'Hello Manolo!')
  assert.end()
})
