import AppError from '../types/error.js';

export const errorUitl = (name: string, code: number) => {
  const error: AppError = new Error(name);
  error.status = code;
  return error;
};
