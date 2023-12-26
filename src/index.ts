import puppeteer, { Browser, Page } from "puppeteer"

import { asyncForEach } from "./helpers/array"
import logger, { Action } from "./services/logger"

const config = {
  url: "https://talker.su",
  browserInstances: 10,
  pagesInBrowser: 15 // max - 16
}

interface StorageItem {
  browser: Browser
  pages: Array<Page>
}

class Test {
  private storage: Array<StorageItem> = []
  private successCalls = 0

  public async start() {
    logger.info("*************************")

    for (let bId = 0; bId < config.browserInstances; bId += 1) {
      const browser = await this.initBrowser(bId)
      if (!browser) {
        logger.error("Initialization browser error", bId)
        continue
      }

      const pages = await this.startTalkers(browser, bId)
      logger.log(Action.Started, bId, pages.length)

      this.storage.push({ browser, pages })
    }

    await this.sleep(7000)

    await asyncForEach(this.storage, async ({pages}, bId) => {
      const successCount = await this.checkPages(pages)
      logger.log(Action.Success, bId, successCount)
    })

    await asyncForEach(this.storage, async ({browser, pages}, bId) => {
      await this.hangupPages(pages)
      logger.log(Action.Hangup, bId)

      browser.close()

      await this.sleep(200)
    })

    this.resultLog()

    process.exit(0)
  }

  private async initBrowser(bId: number): Promise<Browser | null> {
    const browser = await puppeteer.launch({
      defaultViewport: null,
      headless: false,
      args: [
        "allow-file-access-from-files",
        "--use-fake-ui-for-media-stream",
        "--use-fake-device-for-media-stream",
        "--mute-audio",
        "--window-size=1024,768",
        `--window-position=${5 * bId},${30 * bId}`
      ]
    })

    if (!browser) return null

    const context = browser.defaultBrowserContext()
    context.overridePermissions(config.url, ["notifications"])

    return browser
  }

  private async startTalkers(browser: Browser, bId: number): Promise<Array<Page>> {
    const pages: Array<Page> = []

    const [initPage] = await browser.pages()
    await this.loadTalker(initPage, bId)

    pages.push(initPage)

    for (let pId = 1; pId < config.pagesInBrowser; pId += 1) {
      const page = await browser.newPage()
      await this.loadTalker(page, bId)

      pages.push(page)
    }

    return pages
  }

  private async loadTalker(page: Page, bId: number): Promise<Page | null> {
    page.on('dialog', async dialog => await dialog.accept())

    await page.goto(config.url)

    await this.sleep(400)
    const startButton = await page.$("#button-start")

    if(!startButton) {
      logger.error("Start button not found", bId)
      return null
    }

    await startButton.click()

    return page
  }

  private async checkPages(pages: Array<Page>): Promise<number> {
    let successPagesCount = 0

    await asyncForEach(pages, async page => {
      await page.bringToFront()

      const cancelButton = await page.$("#button-cancel")
      if(cancelButton) {
        successPagesCount += 1
        this.successCalls += 1
      }
    })

    return successPagesCount
  }

  private async hangupPages(pages: Array<Page>): Promise<void> {
    await asyncForEach(pages, async page => {
      await page.bringToFront()

      try {
        const cancelButton = await page.$("#button-cancel")
        //if(!cancelButton) return logger.error("Cancel button not found", bId)
        await cancelButton?.click()
      } catch {
        // logger.error("Cancel button not found", bId)
      } finally {
        page.close()
      }
    })
  }

  private resultLog() {
    logger.info("*************************")
    logger.info(`Calls finished ${this.successCalls}/${config.browserInstances * config.pagesInBrowser}`)
    logger.info(`Execution time: ${process.uptime().toFixed(2)}s.`)
    logger.info("*************************")
  }

  private sleep(delay = 1000) {
    return new Promise(resolve => setTimeout(resolve, delay))
  }
}

new Test().start()
