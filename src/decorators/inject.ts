/*
 * @adonisjs/fold
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Initiating the "containerInjections" property on the target, which is assumed
 * to be the class constructor.
 */
function initiateContainerInjections(target: any, method: string | symbol) {
  if (!target.hasOwnProperty('containerInjections')) {
    Object.defineProperty(target, 'containerInjections', {
      value: {},
    })
  }

  target.containerInjections[method] = target.containerInjections[method] || []
}

/**
 * Defining the injections for the constructor of the class using
 * reflection
 */
function defineConstructorInjections(target: any) {
  const params = Reflect.getMetadata('design:paramtypes', target)
  if (!params) {
    return
  }

  initiateContainerInjections(target, '_constructor')
  for (const param of params) {
    target.containerInjections._constructor.push(param)
  }
}

/**
 * Defining the injections for the class instance method
 */
function defineMethodInjections(target: any, method: string | symbol) {
  const constructor = target.constructor
  const params = Reflect.getMetadata('design:paramtypes', target, method)
  if (!params) {
    return
  }

  initiateContainerInjections(constructor, method)
  for (const param of params) {
    constructor.containerInjections[method].push(param)
  }
}

export function inject() {
  function injectDecorator<C extends Function>(target: C): void
  function injectDecorator(target: any, propertyKey: string | symbol): void
  function injectDecorator(target: any, propertyKey?: string | symbol): void {
    if (!propertyKey) {
      defineConstructorInjections(target)
      return
    }

    defineMethodInjections(target, propertyKey)
  }

  return injectDecorator
}