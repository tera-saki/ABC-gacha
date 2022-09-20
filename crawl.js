const { Builder, By, until } = require('selenium-webdriver')
const { Options } = require('selenium-webdriver/chrome')

const {
  contest: Contest,
  problem: Problem
} = require('./models')

const { colors } = require('./constant')

const contestSeqNumber = (contestName) => {
  const regex = /ABC(\d+)/
  return parseInt(regex.exec(contestName)[1])
}

const problemNum = (contestName) => {
  const seq = contestSeqNumber(contestName)
  return seq >= 212 ? 8 : seq >= 126 ? 6 : 4
}

const isRated = (contestName) => {
  const seq = contestSeqNumber(contestName)
  return seq >= 42
}

const diffLevel = (diffColor) => {
  return colors[diffColor]
}

async function createDriver() {
  const options = new Options().addArguments(['--headless', '--lang=ja'])
  return await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build()
}

async function getContestName(tds) {
  const td0 = await tds[0].findElement(By.css('a'))
  const contestName = await td0.getText()
  return contestName
}

async function parseContest(tds) {
  const problems = []
  for (let i = 0; i < tds.length; i++) {
    const td = await tds[i].findElement(By.css('a'))
    const title = await td.getText()
    const regex = /([A-Za-z]+)\. (.+)/
    const [_, index, name] = regex.exec(title)
    let level
    try {
      const diffClass = await td.getAttribute('class')
      const diffColor = diffClass.split('-')[1]
      level = diffLevel(diffColor)
    } catch (e) {
      level = null
    }
    problems.push({ index, level, name })
  }
  return problems
}

async function getNewContests(driver) {
  await driver.get('https://kenkoooo.com/atcoder')
  await driver.sleep(1000)

  const tbody = await driver.findElement(By.css('tbody'))
  const trs = await tbody.findElements(By.css('tr'))

  const contests = {}
  for (const tr of trs) {
    try {
      const tds = await tr.findElements(By.css('td'))

      const contestName = await getContestName(tds)
      const contest = await Contest.findOne({
        where: {
          name: contestName
        }
      })
      if (contest) break

      const pn = problemNum(contestName)
      contests[contestName] = await parseContest(tds.slice(1, pn + 1))
    } catch (e) {
      console.error('Failed to parse contest.', e)
    }
  }
  return contests
}

async function registerContest(contests) {
  const names = Object.keys(contests)
  names.sort()

  for (const name of names) {
    const contest = await Contest.create({
      name,
      rated: isRated(name)
    })

    const problems = contests[name].map(problem => {
      return {
        index: problem.index,
        name: problem.name,
        diff_level: problem.level,
        contest_id: contest.id
      }
    })
    await Problem.bulkCreate(problems)
    console.log(`Registered ${name}.`)
  }
}

async function main() {
  let driver
  try {
    driver = await createDriver()
    const contests = await getNewContests(driver)
    await registerContest(contests)
  } catch (e) {
    console.error(e)
  } finally {
    await driver.quit()
  }
}

main().then(() => process.exit(0))