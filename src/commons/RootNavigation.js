import React from 'react';
import {StackActions} from '@react-navigation/native';

export const rootNavg = React.createRef();

export function navigate(...args) {
  rootNavg.current?.navigate(...args);
}

export function getRoute() {
  return rootNavg.current?.getCurrentRoute();
}

export function push(...args) {
  rootNavg.current?.dispatch(StackActions.push(...args));
}
