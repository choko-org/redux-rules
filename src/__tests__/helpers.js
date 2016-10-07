import test from 'tape'
import { truthyCondition, byActionType } from '../index'

test('Helpers: should filter by action type', assert => {
  const LOGIN = 'LOGIN'
  const LOGOUT = 'LOGOUT'
  const REGISTRATE = 'REGISTRATE'
  const FLASH_MESSAGE = 'FLASH_MESSAGE'
  const SHOW_BANNER = 'SHOW_BANNER'
  const HIDE_BANNER = 'HIDE_BANNER'

  const mockRules = [
    { actionTypes: [LOGIN, REGISTRATE], type: FLASH_MESSAGE },
    { actionTypes: [LOGOUT], type: SHOW_BANNER },
    { actionTypes: [LOGIN], type: HIDE_BANNER },
  ]

  const loginRules = mockRules.filter(byActionType(LOGIN))

  assert.isEqual(loginRules.length, 2)
  assert.isEqual(loginRules[0].type, FLASH_MESSAGE)
  assert.isEqual(loginRules[1].type, HIDE_BANNER)
  assert.end()
})

test('Helpers: should filter rules with truthy conditions', assert => {
  const FLASH_MESSAGE = 'FLASH_MESSAGE'
  const SHOW_BANNER = 'SHOW_BANNER'
  const HIDE_BANNER = 'HIDE_BANNER'

  const mockRules = [
    { condition: facts => facts.name === 'Pedro', type: FLASH_MESSAGE },
    { condition: facts => facts.name === 'Sebas', type: SHOW_BANNER },
    { condition: facts => facts.name === 'Pedro', type: HIDE_BANNER },
  ]

  const mockFacts = { name: 'Pedro' }
  const loginRules = mockRules.filter(truthyCondition(mockFacts))

  assert.isEqual(loginRules.length, 2)
  assert.isEqual(loginRules[0].type, FLASH_MESSAGE)
  assert.isEqual(loginRules[1].type, HIDE_BANNER)
  assert.end()
})
