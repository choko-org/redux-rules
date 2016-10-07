import test from 'tape'
import insertRules from '../index'

test('Rules should have a basic structure', assert => {

  const LOGIN_SUCCESS = 'users/login/SUCESS'
  const WELCOME_MESSAGE = 'users/login/WELCOME_MESSAGE'

  const welcomeMessageRule = {
    type: WELCOME_MESSAGE,
    actionTypes: [ LOGIN_SUCCESS ],
    condition: () => true,
    reaction: store => next => action => next(action)
  }

  const { condition, ...ruleWithoutCondition } = welcomeMessageRule
  assert.throws(
    () => insertRules({ rules: [ruleWithoutCondition] }),
    /WELCOME_MESSAGE/
  )
  assert.end()
})
