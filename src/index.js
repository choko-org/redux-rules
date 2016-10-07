import { compose } from 'redux'

const insertRules = ({ rules = [] }) => {
  const verifiedRules = rules.filter(verifyStructure)

  return store => next => action => {
    const { getState } = store
    const truthyReactions = rules
      .filter(byActionType(action.type))
      .filter(truthyCondition({ state: getState(), action }))
      .map(rule => rule.reaction)


    if (truthyReactions.length === 0) return next(action)

    return compose(...truthyReactions)(store)(next)(action)
  }
}

const verifyStructure = rule => {
  const { type, condition, actionTypes, reaction } = rule
  const result = (typeof type === 'string') &&
    (typeof actionTypes === 'object') &&
    (typeof condition === 'function') &&
    (typeof reaction === 'function')

  if (result === false) {
    throw new TypeError('Rule  "' + type + '" miss a property.')
  }

  return result
}

export const truthyCondition = facts => rule => rule.condition(facts)

export const byActionType = actionType => rule => rule.actionTypes
  .some(type => type === actionType)

export default insertRules
