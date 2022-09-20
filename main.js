const {
  problem: Problem,
  contest: Contest,
  sequelize
} = require('./models')

const { colors } = require('./constant')
const config = require('./config/config.json')

async function main() {
  const problems = []

  for (const [key, value] of Object.entries(config.difficulties)) {
    if (value === 0) continue
    const res = await Problem.findAll({
      where: {
        diff_level: colors[key]
      },
      include: {
        model: Contest,
        where: config.only_rated ? { rated: true } : {}
      },
      order: sequelize.random(),
      limit: value
    })
    for (const problem of res) {
      problems.push({
        id: `${problem.contest.name}_${problem.index}`,
        name: problem.name,
        level: problem.diff_level
      })
    }
  }
  console.log(problems);
}

main().then(() => process.exit(0))