export const testCase = {
  id: 'CASE-025',
  module: 'Manage Users Module',
  screen: 'Players Page',
  description:
    'Validate by opening the Players Page, searching player records, viewing details, and using available actions.',
  expectedResult:
    'Able to view player records, search users, force password reset, delete users, and log admin actions.',
}

export function verifySpecification() {
  return (
    testCase.screen === 'Players Page' &&
    testCase.expectedResult.includes('log admin actions')
  )
}

export default testCase
