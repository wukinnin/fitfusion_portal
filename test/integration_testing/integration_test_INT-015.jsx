export const testCase = {
  id: 'INT-015',
  module1: 'Manage Users Module',
  module2: 'View Dashboard Module',
  process:
    'Test integration when admin management actions affect portal-visible active user records.',
  precondition: 'Admin updates or deletes a player/admin account.',
  expectedResult:
    'Players/Admins tables and dashboard counts reflect the updated active user records.',
}

export function verifySpecification() {
  return (
    testCase.precondition.includes('player/admin account') &&
    testCase.expectedResult.includes('dashboard counts')
  )
}

export default testCase
