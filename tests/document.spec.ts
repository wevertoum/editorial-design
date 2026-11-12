import { expect, test } from '@playwright/test'

test('the report renders as a site', async ({ page }) => {
  const pageErrors: string[] = []
  const failed: string[] = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  page.on('response', (response) => {
    if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`)
  })

  await page.goto('/')
  await page.waitForFunction(() => document.documentElement.dataset.pagesReady === '1')

  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
  await expect(page.locator('html')).toHaveAttribute('data-profile', 'screen')
  await expect(page.locator('.desk')).toHaveAttribute('data-pagination-engine', 'chromium-print')
  await expect(page.locator('.preview-banner')).toContainText('páginas A4')
  await expect(page.locator('.desk .sheet').first()).toBeVisible()

  const pages = await page.locator('.desk .sheet').evaluateAll((nodes) => {
    const boxes = nodes.map((node) => {
      const box = node.getBoundingClientRect()
      return { width: Math.round(box.width), height: Math.round(box.height) }
    })
    return {
      count: boxes.length,
      widths: [...new Set(boxes.map((box) => box.width))],
      heights: [...new Set(boxes.map((box) => box.height))],
    }
  })
  expect(pages.count).toBeGreaterThan(20)
  expect(pages.widths).toEqual([pages.widths[0]])
  expect(pages.heights).toEqual([pages.heights[0]])

  const broken = await page.evaluate(() =>
    [...document.querySelectorAll('img')]
      .filter((img) => !img.complete || img.naturalWidth === 0)
      .map((img) => img.getAttribute('src')),
  )
  expect(broken).toEqual([])
  expect(pageErrors).toEqual([])
  expect(failed).toEqual([])
})
