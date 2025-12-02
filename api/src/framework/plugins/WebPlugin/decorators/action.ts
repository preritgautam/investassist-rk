import 'reflect-metadata';
import { FactoryName } from '../../../core/container';

export type RequestMethod = 'get' | 'post' | 'put' | 'delete' | 'options' | 'patch' | 'head';

export type ActionOptions = {
  route?: string,
  methods?: RequestMethod[],
  name?: string,
  middlewares?: FactoryName[]
}

export type MethodActionOptions = Omit<ActionOptions, 'methods'>;
export type RouteOrMethodActionOptions = string | MethodActionOptions;
export type RouteOrActionOptions = string | ActionOptions;

export const ActionKey = Symbol('Action');

export function action(routeOrOptions: RouteOrActionOptions = '', options: ActionOptions = {}) {
  if (typeof routeOrOptions === 'string') {
    options = { ...options, route: routeOrOptions };
  } else {
    options = routeOrOptions;
  }
  return function(target: any, propertyKey: string) {
    const definedActions = Reflect.getOwnMetadata(ActionKey, target) || [];
    definedActions.push({
      propertyKey,
      options,
    });
    Reflect.defineMetadata(ActionKey, definedActions, target);
  };
}

function handleAction(
  method: string, routeOrOptions: RouteOrMethodActionOptions = '', options: MethodActionOptions = {},
) {
  if (typeof routeOrOptions === 'string') {
    options = { ...options, route: routeOrOptions };
  } else {
    options = routeOrOptions;
  }
  return action({
    ...options,
    methods: [<RequestMethod>method],
  });
}

export function get(routeOrOptions: RouteOrMethodActionOptions = '', options: MethodActionOptions = {}) {
  return handleAction('get', routeOrOptions, options);
}


export function post(routeOrOptions: RouteOrMethodActionOptions = '', options: MethodActionOptions = {}) {
  return handleAction('post', routeOrOptions, options);
}

export function put(routeOrOptions: RouteOrMethodActionOptions = '', options: MethodActionOptions = {}) {
  return handleAction('put', routeOrOptions, options);
}

export function delete_(routeOrOptions: RouteOrMethodActionOptions = '', options: MethodActionOptions = {}) {
  return handleAction('delete', routeOrOptions, options);
}

export function patch(routeOrOptions: RouteOrMethodActionOptions = '', options: MethodActionOptions = {}) {
  return handleAction('patch', routeOrOptions, options);
}

export function options(routeOrOptions: RouteOrMethodActionOptions = '', options: MethodActionOptions = {}) {
  return handleAction('options', routeOrOptions, options);
}

export function head(routeOrOptions: RouteOrMethodActionOptions = '', options: MethodActionOptions = {}) {
  return handleAction('head', routeOrOptions, options);
}


