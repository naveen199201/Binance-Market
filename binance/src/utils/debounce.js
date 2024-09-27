import { debounce } from 'lodash';

const createDebouncedFunction = (callback, delay) => {
  return debounce(callback, delay);
};

export default createDebouncedFunction;
