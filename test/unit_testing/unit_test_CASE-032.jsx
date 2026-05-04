export const testCase = {
  id: 'CASE-032',
  module: 'View Performance Module',
  screen: 'Admin Portal Leaderboards Page',
  description:
    'Validate by opening the Admin Portal Leaderboards Page and changing the ranking scope.',
  expectedResult: 'Able to display per-workout and lifetime leaderboard tables.',
}

export function verifySpecification() {
  return (
    testCase.screen.includes('Leaderboards') &&
    testCase.expectedResult.includes('lifetime leaderboard')
  )
}

export default testCase
