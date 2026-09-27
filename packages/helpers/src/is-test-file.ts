/** Test code in any of the layouts the repositories use: none of it is packed. */
export const isTestFile = (file: string): boolean =>
  /\.(test|spec)\.[cm]?[jt]sx?$/.test(file) ||
  file.includes('/__tests__/') ||
  file.includes('/__fixtures__/') ||
  file.includes('/e2e/');
