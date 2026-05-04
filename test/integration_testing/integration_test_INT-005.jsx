export const testCase = {
  id: 'INT-005',
  module1: 'Login Module',
  module2: 'Manage Profile Module',
  process:
    'Test integration when administrator password recovery moves from email verification to new password creation.',
  precondition: 'Admin requests password recovery and submits valid OTP.',
  expectedResult:
    'Admin can set a new password and use it for subsequent portal login.',
}

export function verifySpecification() {
  return (
    testCase.precondition.includes('valid OTP') &&
    testCase.expectedResult.includes('subsequent portal login')
  )
}

export default testCase
