export const testCase = {
  id: 'CASE-006',
  module: 'Login Module',
  screen: 'Admin Login Page',
  description:
    'Validate by entering valid administrator credentials on the Admin Login Page.',
  expectedResult:
    'Able to authenticate the admin and redirect to the Admin Dashboard Page.',
}

export function verifySpecification() {
  return (
    testCase.module === 'Login Module' &&
    testCase.expectedResult.includes('Admin Dashboard Page')
  )
}

export default testCase
