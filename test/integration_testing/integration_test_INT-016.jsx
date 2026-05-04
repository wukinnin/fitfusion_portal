export const testCase = {
  id: 'INT-016',
  module1: 'Manage Users Module',
  module2: 'Login Module',
  process:
    'Test integration when admin self-protection prevents restricted actions on the current admin account.',
  precondition: 'Admin is logged in and views the Admins Page.',
  expectedResult:
    'Current admin account is marked and restricted actions are disabled while other permitted admin actions remain available.',
}

export function verifySpecification() {
  return (
    testCase.precondition.includes('Admins Page') &&
    testCase.expectedResult.includes('restricted actions')
  )
}

export default testCase
