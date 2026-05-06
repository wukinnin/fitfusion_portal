const COLORS = {
  ink: [17, 24, 39],
  muted: [107, 114, 128],
  line: [229, 231, 235],
  soft: [249, 250, 251],
  blue: [37, 99, 235],
  green: [22, 163, 74],
  amber: [217, 119, 6],
  rose: [225, 29, 72],
  purple: [124, 58, 237],
  slate: [71, 85, 105],
}

const CHART_COLORS = [COLORS.blue, COLORS.green, COLORS.amber, COLORS.rose, COLORS.purple, COLORS.slate]

async function createDoc(title) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  doc.setProperties({ title, subject: 'FitFusion Portal Export Report' })
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

function writeHeader(doc, title, subtitle) {
  setColor(doc, COLORS.ink)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text(title, 48, 54)

  setColor(doc, COLORS.muted)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(subtitle, 48, 72)

  setColor(doc, COLORS.line, 'draw')
  doc.line(48, 90, pageWidth(doc) - 48, 90)
  return 118
}

function sectionTitle(doc, title, y) {
  y = ensureSpace(doc, y, 34)
  setColor(doc, COLORS.ink)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text(title, 48, y)
  return y + 18
}

function metricGrid(doc, metrics, y) {
  y = ensureSpace(doc, y, 78)
  const gap = 10
  const colCount = Math.min(3, metrics.length || 1)
  const width = (pageWidth(doc) - 96 - gap * (colCount - 1)) / colCount
  let x = 48
  let rowY = y

  metrics.forEach((metric, index) => {
    if (index > 0 && index % colCount === 0) {
      x = 48
      rowY += 66
    }
    if (index > 0 && index % (colCount * 3) === 0) {
      rowY = ensureSpace(doc, rowY, 76)
    }

    setColor(doc, COLORS.soft, 'fill')
    setColor(doc, COLORS.line, 'draw')
    doc.roundedRect(x, rowY, width, 52, 4, 4, 'FD')

    setColor(doc, COLORS.muted)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text(String(metric.label).toUpperCase(), x + 10, rowY + 17, { maxWidth: width - 20 })

    setColor(doc, COLORS.ink)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.text(String(metric.value), x + 10, rowY + 38, { maxWidth: width - 20 })

    x += width + gap
  })

  return rowY + 70
}

function countBy(rows, getKey) {
  const counts = {}
  for (const row of rows || []) {
    const key = getKey(row) || 'Unknown'
    counts[key] = (counts[key] || 0) + 1
  }
  return counts
}

function topEntries(counts, limit = 6) {
  return Object.entries(counts || {})
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
}

function mostCommon(counts) {
  const top = topEntries(counts, 1)[0]
  return top ? `${top[0]} (${top[1]})` : 'None'
}

function drawBarChart(doc, title, counts, y) {
  const entries = topEntries(counts, 6)
  y = ensureSpace(doc, y, 138)
  y = sectionTitle(doc, title, y)

  if (entries.length === 0) {
    return emptyNote(doc, 'No records available.', y)
  }

  const chartX = 56
  const chartW = pageWidth(doc) - 112
  const barH = 12
  const max = Math.max(...entries.map((entry) => entry[1]), 1)

  entries.forEach(([label, value], index) => {
    const rowY = y + index * 20
    const barW = (value / max) * (chartW - 140)
    setColor(doc, COLORS.muted)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text(String(label), chartX, rowY + 9, { maxWidth: 120 })

    setColor(doc, CHART_COLORS[index % CHART_COLORS.length], 'fill')
    doc.roundedRect(chartX + 132, rowY, Math.max(barW, value > 0 ? 2 : 0), barH, 2, 2, 'F')

    setColor(doc, COLORS.ink)
    doc.text(String(value), chartX + 138 + barW, rowY + 9)
  })

  return y + entries.length * 20 + 18
}

function drawPieChart(doc, title, counts, y) {
  const entries = topEntries(counts, 6)
  y = ensureSpace(doc, y, 158)
  y = sectionTitle(doc, title, y)

  if (entries.length === 0) {
    return emptyNote(doc, 'No records available.', y)
  }

  const total = entries.reduce((sum, entry) => sum + entry[1], 0)
  const cx = 92
  const cy = y + 44
  const r = 38
  let start = -90

  entries.forEach(([, value], index) => {
    const sweep = total > 0 ? (value / total) * 360 : 0
    drawPieSlice(doc, cx, cy, r, start, start + sweep, CHART_COLORS[index % CHART_COLORS.length])
    start += sweep
  })

  let legendY = y + 5
  entries.forEach(([label, value], index) => {
    setColor(doc, CHART_COLORS[index % CHART_COLORS.length], 'fill')
    doc.rect(156, legendY - 7, 8, 8, 'F')
    setColor(doc, COLORS.ink)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text(`${label}: ${value}`, 170, legendY, { maxWidth: pageWidth(doc) - 220 })
    legendY += 16
  })

  return Math.max(y + 102, legendY + 12)
}

function drawPieSlice(doc, cx, cy, r, startDeg, endDeg, color) {
  const points = [[cx, cy]]
  const steps = Math.max(3, Math.ceil((endDeg - startDeg) / 12))
  for (let i = 0; i <= steps; i += 1) {
    const angle = (Math.PI / 180) * (startDeg + ((endDeg - startDeg) * i) / steps)
    points.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r])
  }

  setColor(doc, color, 'fill')
  doc.triangle(points[0][0], points[0][1], points[1][0], points[1][1], points[2][0], points[2][1], 'F')
  for (let i = 2; i < points.length - 1; i += 1) {
    doc.triangle(cx, cy, points[i][0], points[i][1], points[i + 1][0], points[i + 1][1], 'F')
  }
}

function emptyNote(doc, message, y) {
  y = ensureSpace(doc, y, 24)
  setColor(doc, COLORS.muted)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(message, 48, y)
  return y + 24
}

function drawInsights(doc, title, insights, y) {
  const usefulInsights = (insights || []).filter(Boolean)
  y = ensureSpace(doc, y, 44 + usefulInsights.length * 24)
  y = sectionTitle(doc, title, y)

  if (usefulInsights.length === 0) {
    return emptyNote(doc, 'No report insights available yet.', y)
  }

  usefulInsights.forEach((insight) => {
    y = ensureSpace(doc, y, 30)
    setColor(doc, COLORS.soft, 'fill')
    setColor(doc, COLORS.line, 'draw')
    doc.roundedRect(48, y - 12, pageWidth(doc) - 96, 24, 4, 4, 'FD')
    setColor(doc, COLORS.ink)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.text(insight, 60, y + 3, { maxWidth: pageWidth(doc) - 120 })
    y += 32
  })

  return y + 4
}

function drawTable(doc, title, columns, rows, y, limit = 12) {
  y = ensureSpace(doc, y, 72)
  y = sectionTitle(doc, title, y)

  if (!rows || rows.length === 0) {
    return emptyNote(doc, 'No records available.', y)
  }

  const visibleRows = rows.slice(0, limit)
  const tableW = pageWidth(doc) - 96
  const colW = tableW / columns.length
  const rowH = 22

  y = ensureSpace(doc, y, rowH * (visibleRows.length + 2))
  setColor(doc, COLORS.soft, 'fill')
  doc.rect(48, y - 12, tableW, rowH, 'F')

  columns.forEach((col, index) => {
    setColor(doc, COLORS.muted)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.text(col.label, 54 + index * colW, y + 2, { maxWidth: colW - 12 })
  })

  y += rowH
  visibleRows.forEach((row) => {
    y = ensureSpace(doc, y, rowH + 4)
    setColor(doc, COLORS.line, 'draw')
    doc.line(48, y - 12, pageWidth(doc) - 48, y - 12)
    columns.forEach((col, index) => {
      setColor(doc, COLORS.ink)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.text(truncate(String(col.value(row) ?? ''), 42), 54 + index * colW, y + 1, { maxWidth: colW - 12 })
    })
    y += rowH
  })

  if (rows.length > limit) {
    setColor(doc, COLORS.muted)
    doc.setFontSize(8)
    doc.text(`Showing ${limit} of ${rows.length} records.`, 48, y)
    y += 16
  }

  return y + 10
}

function truncate(value, max) {
  if (value.length <= max) return value
  return `${value.slice(0, max - 3)}...`
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

function formatNumber(value, digits = 0) {
  return Number(value || 0).toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  })
}

function formatDate(value) {
  if (!value) return 'Unknown'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown'
  return date.toLocaleString()
}

function dateRange(rows, getValue) {
  const dates = (rows || [])
    .map((row) => new Date(getValue(row)).getTime())
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b)

  if (dates.length === 0) return 'No dates'
  return `${formatDate(dates[0])} - ${formatDate(dates[dates.length - 1])}`
}

function topAchievementUnlock(rows) {
  const counts = countBy(rows, (row) => row.achievement_title || row.achievement_code || row.achievement_id)
  return mostCommon(counts)
}

function percentage(value, digits = 0) {
  if (!Number.isFinite(value)) return '0%'
  return `${formatNumber(value, digits)}%`
}

function percentOf(part, total, digits = 0) {
  if (!total) return '0%'
  return percentage((part / total) * 100, digits)
}

function comparisonInsight(counts, subject, verb = 'appears') {
  const entries = topEntries(counts, 2)
  if (entries.length === 0) return `No ${subject} records are available yet.`
  if (entries.length === 1) return `${entries[0][0]} is the only ${subject} currently represented.`

  const [[topLabel, topValue], [secondLabel, secondValue]] = entries
  if (secondValue === 0) return `${topLabel} is the only ${subject} with recorded activity.`

  const delta = ((topValue - secondValue) / secondValue) * 100
  if (delta === 0) return `${topLabel} and ${secondLabel} are tied as the leading ${subject}.`
  return `${topLabel} ${verb} ${percentage(delta, 1)} more often than ${secondLabel}.`
}

function reportOverviewInsights(tableReports) {
  const reports = tableReports || []
  const reportMap = Object.fromEntries(reports.map((report) => [report.key, report.rows || []]))
  const insights = []

  const totalRecords = reports.reduce((sum, report) => sum + (report.rows?.length || 0), 0)
  insights.push(`This report summarizes ${formatNumber(totalRecords)} records across ${formatNumber(reports.length)} selected data sections.`)

  if (reportMap.users) {
    const users = reportMap.users
    const players = users.filter((row) => row.role === 'player').length
    const admins = users.filter((row) => row.role === 'admin').length
    const verified = users.filter((row) => row.is_email_verified).length
    insights.push(`Players account for ${percentOf(players, users.length)} of users; admins account for ${percentOf(admins, users.length)}.`)
    insights.push(`${percentOf(verified, users.length)} of user emails are verified.`)
  }

  if (reportMap.sessions) {
    const sessions = reportMap.sessions
    const workouts = countBy(sessions, (row) => row.workout_type)
    const wins = sessions.filter((row) => row.won).length
    insights.push(comparisonInsight(workouts, 'workout type', 'is performed'))
    insights.push(`The current session win rate is ${percentOf(wins, sessions.length, 1)}.`)
  }

  if (reportMap.user_achievements) {
    const unlocks = reportMap.user_achievements
    const uniqueUsers = new Set(unlocks.map((row) => row.user_id).filter(Boolean)).size
    insights.push(`${formatNumber(uniqueUsers)} users have at least one achievement unlock in the selected data.`)
    insights.push(comparisonInsight(countBy(unlocks, (row) => row.achievement_title || row.achievement_code || row.achievement_id), 'achievement', 'is unlocked'))
  }

  return insights
}

function usersInsights(rows, roleCounts, verified) {
  return [
    rows.length === 0 ? 'No user records are available yet.' : `Players make up ${percentOf(roleCounts.player || 0, rows.length)} of the user base.`,
    rows.length === 0 ? null : `Admins make up ${percentOf(roleCounts.admin || 0, rows.length)} of accounts.`,
    rows.length === 0 ? null : `${percentOf(verified, rows.length)} of users have verified email addresses.`,
  ]
}

function sessionInsights(rows, workoutCounts, wins) {
  return [
    comparisonInsight(workoutCounts, 'workout type', 'is performed'),
    rows.length === 0 ? null : `Players win ${percentOf(wins, rows.length, 1)} of recorded sessions.`,
    rows.length === 0 ? null : `A typical completed session averages ${formatNumber(average(rows, (row) => row.total_reps), 1)} reps and ${formatNumber(average(rows, (row) => row.total_time_seconds), 1)} seconds.`,
  ]
}

function achievementInsights(rows) {
  return [
    rows.length === 0 ? 'No achievement definitions are available yet.' : `${formatNumber(rows.length)} achievement definitions are configured for the game.`,
    rows.length === 0 ? null : `${percentOf(rows.filter((row) => row.description).length, rows.length)} of achievement definitions include descriptions.`,
  ]
}

function userAchievementInsights(rows, unlockCounts, uniqueUsers) {
  return [
    rows.length === 0 ? 'No achievement unlock records are available yet.' : `${formatNumber(uniqueUsers)} users have unlocked at least one achievement.`,
    comparisonInsight(unlockCounts, 'achievement', 'is unlocked'),
    rows.length === 0 ? null : `Achievement unlocks average ${formatNumber(rows.length / Math.max(uniqueUsers, 1), 1)} per unlocking user.`,
  ]
}

function adminLogInsights(rows, actionCounts, roleCounts, uniqueAdmins) {
  return [
    rows.length === 0 ? 'No filtered admin log records are available for this report.' : `${formatNumber(uniqueAdmins)} admin actor${uniqueAdmins === 1 ? '' : 's'} appear in the filtered audit trail.`,
    comparisonInsight(actionCounts, 'admin action', 'appears'),
    rows.length === 0 ? null : `System-targeted actions represent ${percentOf(roleCounts.system || 0, rows.length, 1)} of the filtered logs.`,
  ]
}

export async function saveAdminLogsPdf(logs, filename) {
  const doc = await createDoc('FitFusion Admin Logs Report')
  let y = writeHeader(doc, 'Admin Logs Report', `Generated ${formatDate(Date.now())}`)
  const rows = logs || []
  const actionCounts = countBy(rows, (log) => log.action)
  const roleCounts = countBy(rows, (log) => log.target_role || 'system')
  const uniqueAdmins = new Set(rows.map((log) => log.admin_uuid || log.actor_user_id).filter(Boolean)).size

  y = metricGrid(doc, [
    { label: 'Displayed Logs', value: formatNumber(rows.length) },
    { label: 'Unique Admins', value: formatNumber(uniqueAdmins) },
    { label: 'Most Common Action', value: mostCommon(actionCounts) },
    { label: 'Date Range', value: dateRange(rows, (log) => log.created_at) },
    { label: 'System Targets', value: formatNumber(roleCounts.system || 0) },
    { label: 'Player Targets', value: formatNumber(roleCounts.player || 0) },
  ], y)

  y = drawInsights(doc, 'Report Insights', adminLogInsights(rows, actionCounts, roleCounts, uniqueAdmins), y)
  y = drawPieChart(doc, 'Target Role Distribution', roleCounts, y)
  y = drawBarChart(doc, 'Top Actions', actionCounts, y)
  drawTable(doc, 'Filtered Log Preview', [
    { label: 'Time', value: (log) => formatDate(log.created_at) },
    { label: 'Admin', value: (log) => log.admin_uuid || log.actor_user_id || '-' },
    { label: 'Action', value: (log) => log.action || '-' },
    { label: 'Target', value: (log) => `${log.target_role || 'system'} ${log.target_uuid || ''}`.trim() },
    { label: 'Details', value: (log) => (log.details ? JSON.stringify(log.details) : '-') },
  ], rows, y, 18)

  doc.save(filename)
}

export async function saveExportDataPdf(tableReports, filename) {
  const doc = await createDoc('FitFusion Data Export Report')
  let y = writeHeader(doc, 'Data Export Report', `Generated ${formatDate(Date.now())}`)

  y = drawInsights(doc, 'Generate Reports Summary', reportOverviewInsights(tableReports), y)

  for (const report of tableReports) {
    y = sectionTitle(doc, report.label, y)
    y = report.render(doc, report.rows || [], y)
  }

  doc.save(filename)
}

export function renderUsersSection(doc, rows, y) {
  const roleCounts = countBy(rows, (row) => row.role || 'unknown')
  const verified = rows.filter((row) => row.is_email_verified).length

  y = metricGrid(doc, [
    { label: 'Total Users', value: formatNumber(rows.length) },
    { label: 'Players', value: formatNumber(roleCounts.player || 0) },
    { label: 'Admins', value: formatNumber(roleCounts.admin || 0) },
    { label: 'Verified Emails', value: formatNumber(verified) },
    { label: 'Unverified Emails', value: formatNumber(rows.length - verified) },
    { label: 'Newest User', value: latestLabel(rows, 'created_at', 'username') },
  ], y)

  y = drawInsights(doc, 'User Insights', usersInsights(rows, roleCounts, verified), y)
  y = drawPieChart(doc, 'Role Distribution', roleCounts, y)
  return y
}

export function renderSessionsSection(doc, rows, y) {
  const workoutCounts = countBy(rows, (row) => row.workout_type)
  const wins = rows.filter((row) => row.won).length

  y = metricGrid(doc, [
    { label: 'Total Sessions', value: formatNumber(rows.length) },
    { label: 'Wins', value: formatNumber(wins) },
    { label: 'Losses', value: formatNumber(rows.length - wins) },
    { label: 'Most Common Workout', value: mostCommon(workoutCounts) },
    { label: 'Avg Reps', value: formatNumber(average(rows, (row) => row.total_reps), 1) },
    { label: 'Avg Time Secs', value: formatNumber(average(rows, (row) => row.total_time_seconds), 1) },
  ], y)

  y = drawInsights(doc, 'Session Insights', sessionInsights(rows, workoutCounts, wins), y)
  y = drawBarChart(doc, 'Workout Distribution', workoutCounts, y)
  return y
}

export function renderAchievementsSection(doc, rows, y) {
  y = metricGrid(doc, [
    { label: 'Definitions', value: formatNumber(rows.length) },
    { label: 'With Description', value: formatNumber(rows.filter((row) => row.description).length) },
    { label: 'First Code', value: rows[0]?.code || 'None' },
  ], y)

  return drawInsights(doc, 'Achievement Insights', achievementInsights(rows), y)
}

export function renderUserAchievementsSection(doc, rows, y) {
  const unlockCounts = countBy(rows, (row) => row.achievement_title || row.achievement_code || row.achievement_id)
  const uniqueUsers = new Set(rows.map((row) => row.user_id).filter(Boolean)).size

  y = metricGrid(doc, [
    { label: 'Total Unlocks', value: formatNumber(rows.length) },
    { label: 'Users With Unlocks', value: formatNumber(uniqueUsers) },
    { label: 'Most Unlocked', value: topAchievementUnlock(rows) },
    { label: 'Date Range', value: dateRange(rows, (row) => row.unlocked_at) },
  ], y)

  y = drawInsights(doc, 'Unlock Insights', userAchievementInsights(rows, unlockCounts, uniqueUsers), y)
  y = drawBarChart(doc, 'Top Achievement Unlocks', unlockCounts, y)
  return y
}

function latestLabel(rows, dateKey, labelKey) {
  const latest = [...(rows || [])]
    .filter((row) => row?.[dateKey])
    .sort((a, b) => new Date(b[dateKey]).getTime() - new Date(a[dateKey]).getTime())[0]

  return latest?.[labelKey] || 'None'
}
