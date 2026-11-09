import { expect, test } from '@playwright/test'

test('specimen preview renders the three composition strategies', async ({ page }) => {
  const pageErrors: string[] = []
  const failed: string[] = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  page.on('response', (response) => {
    if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`)
  })

  await page.goto('/')

  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.locator('html')).toHaveAttribute('data-profile', 'screen')
  await expect(page.locator('.desk')).toHaveAttribute('data-pagination-engine', 'vivliostyle-cli')
  await expect(page.locator('.preview-banner')).toContainText('Screen preview')
  await expect(page.locator('.layout-standard')).toHaveCount(2)
  await expect(page.locator('.layout-timeline')).toHaveCount(1)
  await expect(page.locator('.layout-infographic')).toHaveCount(1)
  await expect(page.locator('.timeline-event')).toHaveCount(7)
  await expect(page.locator('#first-proof .timeline-copy p')).toHaveCount(2)
  await expect(page.locator('#margin-note .timeline-copy p')).toHaveCount(1)
  await expect(page.getByRole('heading', { level: 1, name: 'Setting the page before the press' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 1, name: 'The measure of a sheet' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 1, name: 'From brief to folio' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 1, name: 'One page, placed on purpose' })).toBeVisible()
  await expect(page.locator('.pull-quote')).toHaveCount(1)
  await expect(page.locator('.highlight')).toHaveCount(1)
  await expect(page.locator('.figure img')).toHaveCount(1)
  await expect(page.locator('.editorial-table table')).toHaveCount(1)
  await expect(page.locator('.text-columns')).toHaveCount(1)
  await expect(page.locator('.infographic-stat')).toHaveCount(3)
  await expect(page.locator('.infographic-step')).toHaveCount(4)

  const broken = await page.evaluate(() =>
    [...document.querySelectorAll('img')]
      .filter((img) => !img.complete || img.naturalWidth === 0)
      .map((img) => img.getAttribute('src')),
  )
  expect(broken).toEqual([])

  const infographicFit = await page.evaluate(() => {
    const sheet = document.querySelector('.layout-infographic')
    if (!(sheet instanceof HTMLElement)) return 'missing'
    return sheet.scrollHeight > sheet.clientHeight + 2
      ? `overflow ${sheet.scrollHeight} > ${sheet.clientHeight}`
      : 'ok'
  })
  expect(infographicFit).toBe('ok')
  expect(pageErrors).toEqual([])
  expect(failed).toEqual([])

  await page.screenshot({ path: 'output/screen-preview.png', fullPage: true })
})
