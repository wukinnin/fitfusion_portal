export const testCase = {
  id: 'INT-019',
  module1: 'View Performance Module',
  module2: 'View Performance Module',
  process:
    'Test integration when mobile leaderboard data is also visible in the Admin Portal leaderboard view.',
  precondition: 'Session records exist for one or more workout categories.',
  expectedResult:
    'Mobile and portal leaderboard views display consistent rank, username, and metric values.',
}

export function verifySpecification() {
  return (
    testCase.process.includes('Admin Portal leaderboard') &&
    testCase.expectedResult.includes('consistent rank')
  )
}

export default testCase
