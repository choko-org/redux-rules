import { compose } from 'redux'

const combineRules = ({ rules = [] }) => {
  const verifiedRules = rules.filter(verifyStructure)

  return store => next => action => {
    const { getState } = store
    const truthyReactions = verifiedRules
      .filter(byActionType(action.type))
      .filter(byTruthyCondition({ state: getState(), action }))
      .map(rule => rule.reaction(store))

    if (truthyReactions.length === 0) return next(action)

    // @TODO Dispatch action with the type of each truthy Rule.

    return compose(...truthyReactions)(next)(action)
  }
}

const verifyStructure = rule => {
  const { type, condition, actionTypes, reaction } = rule

  // @TODO: Should be better ways of doing schema check.
  const result = (typeof type === 'string') &&
    Array.isArray(actionTypes) &&
    (typeof condition === 'function') &&
    (typeof reaction === 'function')

  if (result === false) {
    throw new TypeError('Rule  "' + type + '" miss a property.')
  }

  return result
}

export const byTruthyCondition = facts => rule => rule.condition(facts)

export const byActionType = actionType => rule => rule.actionTypes
  .some(type => type === actionType)

export const every = conditions => facts => conditions.every(condition => condition(facts))
export const some = conditions => facts => conditions.some(condition => condition(facts))
export const notEvery = conditions => facts => !conditions.every(condition => condition(facts))
export const notSome = conditions => facts => !conditions.some(condition => condition(facts))

export default combineRules
