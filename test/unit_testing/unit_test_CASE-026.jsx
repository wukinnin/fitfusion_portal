export const testCase = {
  id: 'CASE-026',
  module: 'Manage Users Module',
  screen: 'Admins Page',
  description:
    'Validate by opening the Admins Page, searching admin records, and using permitted account actions.',
  expectedResult:
    'Able to view admin records, mark the current admin, reset other admin passwords, delete allowed admin accounts, and log actions.',
}

export function verifySpecification() {
  return (
    testCase.screen === 'Admins Page' &&
    testCase.expectedResult.includes('current admin')
  )
}

export default testCase
