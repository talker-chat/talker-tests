import { Builder, ThenableWebDriver, By, until } from "selenium-webdriver"
import { Options } from "selenium-webdriver/chrome"

import { asyncForEach } from "./helpers/array"
import logger, { Action } from "./services/logger"

const config = {
  url: "https://talker.su",
  instances: 16
}

const tabs: Array<string> = []
const successCalls: Array<string> = []

const loadSelenium = () => {
  const chromeOptions = new Options()
    .addArguments("allow-file-access-from-files")
    .addArguments("use-fake-device-for-media-stream")
    .addArguments("use-fake-ui-for-media-stream")
    .addArguments("--mute-audio")
    //.addArguments("--disable-notifications")

  return new Builder().forBrowser("chrome").setChromeOptions(chromeOptions).build()
}

const loadTalker = async (driver: ThenableWebDriver) => {
  await driver.get(config.url)

  const tabUid = await driver.getWindowHandle()
  tabs.push(tabUid)

  logger.log(Action.Loaded, tabs.length, tabUid)
}

const startTalker = async (driver: ThenableWebDriver, tabIndex: number, tabUid: string) => {
  await driver.sleep(1000)

  try {
    const startButton = await driver.findElement(By.id("button-start"))

    await startButton.click()
  } catch {
    logger.error("Start button not found", tabIndex, tabUid)
    throw new Error("Start button not found")
  }
}

const loadTabs = async (driver: ThenableWebDriver) => {
  await loadTalker(driver)

  for (let i = 0; i < config.instances - 1; i += 1) {
    await driver.switchTo().newWindow("tab")
    await loadTalker(driver)
  }
}

const startCalls = async (driver: ThenableWebDriver) => {
  return asyncForEach(tabs, async (tab, index) => {
    await driver.switchTo().window(tab)
    await startTalker(driver, index + 1, tab)

    logger.log(Action.Started, index + 1, tab)
  })
}

const checkCalls = async (driver: ThenableWebDriver) => {
  return asyncForEach(tabs, async (tab, index) => {
    await driver.switchTo().window(tab)

    try {
      await driver.wait(until.elementLocated(By.id("button-cancel")), 1000)

      successCalls.push(tab)
      logger.log(Action.Active, index + 1, tab)
    } catch {
      logger.error("Call failed", index + 1, tab)
    }

  })
}

const hangupCalls = async (driver: ThenableWebDriver) => {
  return asyncForEach(tabs, async (tab, index) => {
    await driver.switchTo().window(tab)

    try {
      const cancelButton = await driver.wait(until.elementLocated(By.id("button-cancel")), 1000)
      await cancelButton.click()

      logger.log(Action.Hangup, index + 1, tab)
    }
    catch {}
    finally {
      driver.close()
    }
  })
}

const start = async () => {
  const driver = loadSelenium()
  if (!driver) return logger.error("Driver not loaded")

  logger.info("Driver is ready!")

  await loadTabs(driver)

  await startCalls(driver)

  await driver.sleep(3000)

  await checkCalls(driver)

  await hangupCalls(driver)

  logger.info(`=======================`)
  logger.info(`Calls count: ${tabs.length}`)
  logger.info(`Success calls count: ${successCalls.length}`)

  // driver.close()
  // driver.quit()
  process.exit(0)
}

start()
