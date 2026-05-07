const COLORS = {
  ink: [17, 24, 39],
  body: [55, 65, 81],
  muted: [107, 114, 128],
  line: [209, 213, 219],
  tableFill: [245, 246, 248],
  bar: [75, 85, 99],
  barLight: [229, 231, 235],
}

const WORKOUT_LABELS = {
  squats: 'Squats',
  jumping_jacks: 'Jumping Jacks',
  side_crunches: 'Side Crunches',
}

async function createDoc(title) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  doc.setProperties({ title, subject: 'FitFusion Standard Summary Report' })
  return doc
}

function pageWidth(doc) {
  return doc.internal.pageSize.getWidth()
}

function pageHeight(doc) {
  return doc.internal.pageSize.getHeight()
}

function setColor(doc, color, mode = 'text') {
  if (mode === 'fill') doc.setFillColor(...color)
  else if (mode === 'draw') doc.setDrawColor(...color)
  else doc.setTextColor(...color)
}

function ensureSpace(doc, y, needed) {
  const bottom = pageHeight(doc) - 48
  if (y + needed <= bottom) return y
  doc.addPage()
  return 48
}

function writeReportHeader(doc, title, subtitle) {
  setColor(doc, COLORS.ink)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text(title, 48, 54)

  setColor(doc, COLORS.muted)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(subtitle, 48, 72)

  setColor(doc, COLORS.ink, 'draw')
  doc.setLineWidth(0.8)
  doc.line(48, 92, pageWidth(doc) - 48, 92)
  doc.setLineWidth(0.2)
  return 118
}

function drawSectionHeading(doc, title, y) {
  y = ensureSpace(doc, y, 34)
  setColor(doc, COLORS.ink)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(title, 48, y)
  setColor(doc, COLORS.line, 'draw')
  doc.line(48, y + 8, pageWidth(doc) - 48, y + 8)
  return y + 26
}

function drawMetricTable(doc, title, metrics, y) {
  const rows = (metrics || []).filter(Boolean)
  if (rows.length === 0) return y

  y = ensureSpace(doc, y, 40 + rows.length * 20)
  y = drawSectionHeading(doc, title, y)

  const x = 48
  const width = pageWidth(doc) - 96
  const labelWidth = width * 0.58
  const rowHeight = 20

  setColor(doc, COLORS.tableFill, 'fill')
  doc.rect(x, y - 13, width, rowHeight, 'F')
  setColor(doc, COLORS.ink)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text('Metric', x + 8, y)
  doc.text('Value', x + labelWidth + 8, y)
  y += rowHeight

  rows.forEach((row) => {
    y = ensureSpace(doc, y, rowHeight + 8)
    setColor(doc, COLORS.line, 'draw')
    doc.line(x, y - 13, x + width, y - 13)
    setColor(doc, COLORS.body)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.text(String(row.label), x + 8, y, { maxWidth: labelWidth - 16 })
    setColor(doc, COLORS.ink)
    doc.setFont('helvetica', 'bold')
    doc.text(String(row.value), x + labelWidth + 8, y, { maxWidth: width - labelWidth - 16 })
    y += rowHeight
  })

  setColor(doc, COLORS.line, 'draw')
  doc.line(x, y - 13, x + width, y - 13)
  return y + 14
}

function drawHorizontalBarChart(doc, title, counts, y, options = {}) {
  const entries = topEntries(counts, options.limit || 8)
  y = ensureSpace(doc, y, 44 + Math.max(entries.length, 1) * 22)
  y = drawSectionHeading(doc, title, y)

  if (entries.length === 0) {
    return emptyNote(doc, options.emptyMessage || 'No records available for this chart.', y)
  }

  const x = 48
  const labelWidth = options.labelWidth || 150
  const chartWidth = pageWidth(doc) - 96 - labelWidth - 50
  const max = Math.max(...entries.map((entry) => entry[1]), 1)
  const total = entries.reduce((sum, entry) => sum + entry[1], 0)

  entries.forEach(([label, value]) => {
    y = ensureSpace(doc, y, 24)
    const barWidth = (value / max) * chartWidth
    setColor(doc, COLORS.body)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text(String(label), x, y, { maxWidth: labelWidth - 10 })

    setColor(doc, COLORS.barLight, 'fill')
    doc.rect(x + labelWidth, y - 8, chartWidth, 9, 'F')
    setColor(doc, COLORS.bar, 'fill')
    doc.rect(x + labelWidth, y - 8, Math.max(barWidth, value > 0 ? 1.5 : 0), 9, 'F')

    setColor(doc, COLORS.ink)
    doc.setFont('helvetica', 'bold')
    doc.text(`${formatNumber(value)} (${percentOf(value, total, 1)})`, x + labelWidth + chartWidth + 8, y)
    y += 22
  })

  return y + 10
}

function drawComparisonTable(doc, title, rows, y) {
  const data = (rows || []).filter(Boolean)
  y = ensureSpace(doc, y, 40 + Math.max(data.length, 1) * 20)
  y = drawSectionHeading(doc, title, y)

  if (data.length === 0) {
    return emptyNote(doc, 'No comparison rows available.', y)
  }

  const x = 48
  const width = pageWidth(doc) - 96
  const columns = [
    { label: 'Item', width: width * 0.42, value: (row) => row.label },
    { label: 'Count', width: width * 0.18, value: (row) => formatNumber(row.count) },
    { label: 'Share', width: width * 0.18, value: (row) => row.share },
    { label: 'Rank', width: width * 0.22, value: (row) => row.rank },
  ]

  setColor(doc, COLORS.tableFill, 'fill')
  doc.rect(x, y - 13, width, 20, 'F')
  setColor(doc, COLORS.ink)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  let colX = x
  columns.forEach((column) => {
    doc.text(column.label, colX + 8, y)
    colX += column.width
  })
  y += 20

  data.forEach((row) => {
    y = ensureSpace(doc, y, 26)
    setColor(doc, COLORS.line, 'draw')
    doc.line(x, y - 13, x + width, y - 13)
    setColor(doc, COLORS.body)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    colX = x
    columns.forEach((column) => {
      doc.text(String(column.value(row)), colX + 8, y, { maxWidth: column.width - 16 })
      colX += column.width
    })
    y += 20
  })

  setColor(doc, COLORS.line, 'draw')
  doc.line(x, y - 13, x + width, y - 13)
  return y + 14
}

function drawAchievementDefinitionsTable(doc, title, rows, y) {
  const data = rows || []
  y = ensureSpace(doc, y, 40 + Math.max(data.length, 1) * 32)
  y = drawSectionHeading(doc, title, y)

  if (data.length === 0) {
    return emptyNote(doc, 'No achievement definitions available.', y)
  }

  const x = 48
  const width = pageWidth(doc) - 96
  const columns = [
    { label: '#', width: 24, value: (_row, index) => String(index + 1) },
    { label: 'Code', width: 96, value: (row) => row.code || '-' },
    { label: 'Achievement', width: 130, value: (row) => row.title || '-' },
    { label: 'Unlock Condition', width: width - 250, value: (row) => row.description || '-' },
  ]

  setColor(doc, COLORS.tableFill, 'fill')
  doc.rect(x, y - 13, width, 20, 'F')
  setColor(doc, COLORS.ink)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  let colX = x
  columns.forEach((column) => {
    doc.text(column.label, colX + 6, y)
    colX += column.width
  })
  y += 20

  data.forEach((row, index) => {
    const description = doc.splitTextToSize(row.description || '-', columns[3].width - 12)
    const rowHeight = Math.max(24, description.length * 10 + 8)
    y = ensureSpace(doc, y, rowHeight + 8)
    setColor(doc, COLORS.line, 'draw')
    doc.line(x, y - 13, x + width, y - 13)
    setColor(doc, COLORS.body)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.6)
    colX = x
    columns.forEach((column, columnIndex) => {
      const value = columnIndex === 3 ? description : String(column.value(row, index))
      doc.text(value, colX + 6, y, { maxWidth: column.width - 12 })
      colX += column.width
    })
    y += rowHeight
  })

  setColor(doc, COLORS.line, 'draw')
  doc.line(x, y - 13, x + width, y - 13)
  return y + 14
}

function emptyNote(doc, message, y) {
  y = ensureSpace(doc, y, 24)
  setColor(doc, COLORS.muted)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.8)
  doc.text(message, 48, y, { maxWidth: pageWidth(doc) - 96 })
  return y + 24
}

function countBy(rows, getKey) {
  const counts = {}
  for (const row of rows || []) {
    const key = getKey(row) || 'Unknown'
    counts[key] = (counts[key] || 0) + 1
  }
  return counts
}

function topEntries(counts, limit = 8) {
  return Object.entries(counts || {})
    .filter((entry) => Number(entry[1]) > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
}

function bottomEntries(counts, limit = 3) {
  return Object.entries(counts || {})
    .filter((entry) => Number(entry[1]) >= 0)
    .sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
}

function rankedRows(counts) {
  const total = Object.values(counts || {}).reduce((sum, value) => sum + Number(value || 0), 0)
  return Object.entries(counts || {})
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([label, count], index) => ({
      label,
      count,
      share: percentOf(count, total, 1),
      rank: `#${index + 1}`,
    }))
}

function mostCommon(counts) {
  const top = topEntries(counts, 1)[0]
  return top ? `${top[0]} (${formatNumber(top[1])})` : 'None'
}

function leastCommon(counts) {
  const low = bottomEntries(counts, 1)[0]
  return low ? `${low[0]} (${formatNumber(low[1])})` : 'None'
}

function safeNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function average(rows, getValue) {
  const values = (rows || []).map(getValue).map(safeNumber).filter((value) => value > 0)
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function minPositive(rows, getValue) {
  const values = (rows || []).map(getValue).map(safeNumber).filter((value) => value > 0)
  if (values.length === 0) return 0
  return Math.min(...values)
}

function formatNumber(value, digits = 0) {
  return Number(value || 0).toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  })
}

function percentOf(part, total, digits = 0) {
  if (!total) return '0%'
  return `${formatNumber((Number(part || 0) / Number(total)) * 100, digits)}%`
}

function formatDuration(seconds) {
  const value = safeNumber(seconds)
  if (value <= 0) return 'None'
  const minutes = Math.floor(value / 60)
  const secs = value % 60
  return `${String(minutes).padStart(2, '0')}:${secs.toFixed(2).padStart(5, '0')}`
}

function labelWorkout(value) {
  return WORKOUT_LABELS[value] || value || 'Unknown'
}

function labeledCounts(counts, labeler) {
  return Object.fromEntries(Object.entries(counts || {}).map(([key, value]) => [labeler(key), value]))
}

function sessionMetrics(rows) {
  const wins = rows.filter((row) => row.won).length
  const losses = rows.length - wins
  const bestClearTime = minPositive(rows.filter((row) => row.won), (row) => row.total_time_seconds)
  const bestRepInterval = minPositive(rows, (row) => row.best_rep_interval_seconds)

  return [
    { label: 'Total sessions', value: formatNumber(rows.length) },
    { label: 'Victories', value: formatNumber(wins) },
    { label: 'Defeats', value: formatNumber(losses) },
    { label: 'Win rate', value: percentOf(wins, rows.length, 1) },
    { label: 'Average reps', value: formatNumber(average(rows, (row) => row.total_reps), 1) },
    { label: 'Average clear time', value: formatDuration(average(rows, (row) => row.total_time_seconds)) },
    { label: 'Best clear time', value: formatDuration(bestClearTime) },
    { label: 'Best rep interval', value: bestRepInterval ? `${formatNumber(bestRepInterval, 3)}s` : 'None' },
  ]
}

export async function saveAdminLogsPdf(logs, filename) {
  const doc = await createDoc('FitFusion Admin Logs Report')
  let y = writeReportHeader(doc, 'FitFusion Admin Logs Report', 'Standard summary report')
  const rows = logs || []
  const actionCounts = countBy(rows, (log) => log.action)
  const roleCounts = countBy(rows, (log) => log.target_role || 'system')
  const uniqueAdmins = new Set(rows.map((log) => log.admin_uuid || log.actor_user_id).filter(Boolean)).size

  y = drawMetricTable(doc, 'Summary Metrics', [
    { label: 'Total actions', value: formatNumber(rows.length) },
    { label: 'Unique admin actors', value: formatNumber(uniqueAdmins) },
    { label: 'Most common action', value: mostCommon(actionCounts) },
    { label: 'System targets', value: formatNumber(roleCounts.system || 0) },
    { label: 'Player targets', value: formatNumber(roleCounts.player || 0) },
    { label: 'Admin targets', value: formatNumber(roleCounts.admin || 0) },
  ], y)

  y = drawHorizontalBarChart(doc, 'Action Frequency', actionCounts, y, { limit: 8 })
  drawComparisonTable(doc, 'Target Role Counts', rankedRows(roleCounts), y)

  doc.save(filename)
}

export async function saveExportDataPdf(tableReports, filename) {
  const doc = await createDoc('FitFusion Data Metrics Report')
  let y = writeReportHeader(doc, 'FitFusion Data Metrics Report', 'Standard summary report')
  const reportMap = Object.fromEntries((tableReports || []).map((report) => [report.key, report.rows || []]))

  for (const report of tableReports || []) {
    y = report.render(doc, report.rows || [], y, reportMap)
  }

  doc.save(filename)
}

export function renderUsersSection(doc, rows, y) {
  const roleCounts = countBy(rows, (row) => row.role || 'unknown')
  const total = rows.length
  const players = roleCounts.player || 0
  const admins = roleCounts.admin || 0

  y = drawMetricTable(doc, 'Users', [
    { label: 'Total users', value: formatNumber(total) },
    { label: 'Players', value: formatNumber(players) },
    { label: 'Admins', value: formatNumber(admins) },
    { label: 'Player share', value: percentOf(players, total, 1) },
    { label: 'Admin share', value: percentOf(admins, total, 1) },
  ], y)

  return drawHorizontalBarChart(doc, 'Role Distribution', roleCounts, y)
}

export function renderSessionsSection(doc, rows, y) {
  const workoutCounts = labeledCounts(countBy(rows, (row) => row.workout_type), labelWorkout)

  y = drawMetricTable(doc, 'Sessions - All Workouts Combined', sessionMetrics(rows), y)

  Object.entries(WORKOUT_LABELS).forEach(([key, label]) => {
    y = drawMetricTable(
      doc,
      `Sessions - ${label}`,
      sessionMetrics(rows.filter((row) => row.workout_type === key)),
      y
    )
  })

  return drawHorizontalBarChart(doc, 'Workout Distribution', workoutCounts, y)
}

export function renderAchievementsSection(doc, rows, y, reportMap = {}) {
  const unlockRows = reportMap.user_achievements
  const unlockCounts = unlockRows
    ? countBy(unlockRows, (row) => row.achievement_title || row.achievement_code || row.achievement_id)
    : {}
  const unlockedAchievementIds = new Set((unlockRows || []).map((row) => row.achievement_id).filter(Boolean))
  const lockedCount = unlockRows ? Math.max(rows.length - unlockedAchievementIds.size, 0) : null

  y = drawMetricTable(doc, 'Achievements', [
    { label: 'Achievement definitions', value: formatNumber(rows.length) },
    { label: 'Achievements with unlocks', value: unlockRows ? formatNumber(unlockedAchievementIds.size) : 'Needs unlock data' },
    { label: 'Achievements without unlocks', value: unlockRows ? formatNumber(lockedCount) : 'Needs unlock data' },
    { label: 'Most unlocked achievement', value: unlockRows ? mostCommon(unlockCounts) : 'Needs unlock data' },
    { label: 'Least unlocked achievement', value: unlockRows ? leastCommon(unlockCounts) : 'Needs unlock data' },
  ], y)

  y = drawAchievementDefinitionsTable(doc, 'Unlockable Achievements', rows, y)

  if (unlockRows) {
    y = drawHorizontalBarChart(doc, 'Achievement Unlock Distribution', unlockCounts, y, { limit: 8 })
  }
  return y
}

export function renderUserAchievementsSection(doc, rows, y, reportMap = {}) {
  const unlockCounts = countBy(rows, (row) => row.achievement_title || row.achievement_code || row.achievement_id)
  const uniqueUsers = new Set(rows.map((row) => row.user_id).filter(Boolean)).size

  y = drawMetricTable(doc, 'User Achievements', [
    { label: 'Total unlock records', value: formatNumber(rows.length) },
    { label: 'Users with unlocks', value: formatNumber(uniqueUsers) },
    { label: 'Average unlocks per unlocking user', value: formatNumber(rows.length / Math.max(uniqueUsers, 1), 1) },
    { label: 'Most unlocked achievement', value: mostCommon(unlockCounts) },
    { label: 'Least unlocked achievement', value: leastCommon(unlockCounts) },
  ], y)

  if (!reportMap.achievements) {
    y = drawHorizontalBarChart(doc, 'Achievement Unlock Distribution', unlockCounts, y, { limit: 8 })
  }
  return y
}
