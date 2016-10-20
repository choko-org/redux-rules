import test from 'tape'
import {
  byTruthyCondition,
  byActionType,
  every,
  some,
} from '../index'

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
    { condition: facts => facts.name === 'Manolo', type: FLASH_MESSAGE },
    { condition: facts => facts.name === 'Isaac', type: SHOW_BANNER },
    { condition: facts => facts.name === 'Manolo', type: HIDE_BANNER },
  ]

  const mockFacts = { name: 'Manolo' }
  const loginRules = mockRules.filter(byTruthyCondition(mockFacts))

  assert.isEqual(loginRules.length, 2)
  assert.isEqual(loginRules[0].type, FLASH_MESSAGE)
  assert.isEqual(loginRules[1].type, HIDE_BANNER)
  assert.end()
})

test('Helpers: every conditions', assert => {
  const facts = {
    user: {
      likes: ['skate', 'travel', 'beach'],
      location: 'Floripa, Brasil'
    },
  }

  const likesBeach = ({ user: { likes } }) => likes.some(like => like === 'beach')
  const likesTravel = ({ user: { likes } }) => likes.some(like => like === 'travel')
  const locatesInFloripa = ({ user: { location } }) => location.includes('Floripa')

  const condition = every([likesBeach, likesTravel, locatesInFloripa])

  assert.ok(condition(facts), 'All conditions are true')
  assert.end()
})

test('Helpers: some conditions', assert => {
  const facts = {
    user: {
      likes: ['skate', 'travel', 'beach'],
      location: 'Florianópolis, Brasil'
    },
  }

  const likesBeach = ({ user: { likes } }) => likes.some(like => like === 'beach')
  const likesTravel = ({ user: { likes } }) => likes.some(like => like === 'travel')
  const locatesInSaoPaulo = ({ user: { location } }) => location.includes('São Paulo')

  const condition = some([likesBeach, likesTravel, locatesInSaoPaulo])

  assert.ok(condition(facts), 'Some of the conditions are true')
  assert.end()
})

test('Helpers: should be possible to combine every and some operators', assert => {
  const facts = {
    user: {
      likes: ['skate', 'travel', 'beach'],
      location: 'Montevideo, Uruguay'
    },
  }

  const likesBeach = ({ user: { likes } }) => likes.some(like => like === 'beach')
  const likesTravel = ({ user: { likes } }) => likes.some(like => like === 'travel')
  const locatesInBrasil = ({ user: { location } }) => location.includes('Brasil')
  const locatesInUruguay = ({ user: { location } }) => location.includes('Uruguay')

  const truthyCondition = every([
    likesBeach,
    likesTravel,
    some([locatesInBrasil, locatesInUruguay])
  ])
  assert.ok(truthyCondition(facts), 'Result of combined conditions is true')

  const falsyCondition = every([
    likesBeach,
    likesTravel,
    every([locatesInBrasil, locatesInUruguay])
  ])
  assert.notOk(falsyCondition(facts), 'Result of combined conditions is false')

  assert.end()
})
