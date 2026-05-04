export const testCase = {
  id: 'CASE-023',
  module: 'View Dashboard Module',
  screen: 'Admin Dashboard Page',
  description:
    'Validate by logging in to the Admin Portal and opening the Dashboard Page.',
  expectedResult:
    'Able to view admin profile summary, total players, total sessions, and admin user count.',
}

export function verifySpecification() {
  return (
    testCase.screen === 'Admin Dashboard Page' &&
    testCase.expectedResult.includes('total sessions')
  )
}

export default testCase
