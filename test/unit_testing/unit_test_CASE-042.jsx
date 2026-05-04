export const testCase = {
  id: 'CASE-042',
  module: 'Manage Profile Module',
  screen: 'Admin Settings Page',
  description:
    'Validate by opening the Admin Settings Page and updating admin email or password fields.',
  expectedResult:
    'Able to validate administrator credentials and update account settings.',
}

export function verifySpecification() {
  return (
    testCase.screen === 'Admin Settings Page' &&
    testCase.expectedResult.includes('administrator credentials')
  )
}

export default testCase
