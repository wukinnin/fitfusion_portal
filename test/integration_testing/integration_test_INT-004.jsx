export const testCase = {
  id: 'INT-004',
  module1: 'Login Module',
  module2: 'View Dashboard Module',
  process:
    'Test integration when an administrator logs in and is routed according to role.',
  precondition: 'Admin provides valid portal credentials.',
  expectedResult:
    'Admin is authenticated and redirected to the Admin Dashboard instead of the player application flow.',
}

export function verifySpecification() {
  return (
    testCase.precondition.includes('portal credentials') &&
    testCase.expectedResult.includes('Admin Dashboard')
  )
}

export default testCase
