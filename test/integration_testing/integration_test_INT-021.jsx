export const testCase = {
  id: 'INT-021',
  module1: 'Manage Profile Module',
  module2: 'Login Module',
  process:
    'Test integration when admin settings updates preserve portal authentication and account access.',
  precondition: 'Admin changes email or password from the Admin Settings Page.',
  expectedResult:
    'Portal account settings update successfully and the admin can continue or re-authenticate with valid credentials.',
}

export function verifySpecification() {
  return (
    testCase.precondition.includes('Admin Settings Page') &&
    testCase.expectedResult.includes('re-authenticate')
  )
}

export default testCase
