const axios = require('axios')
const fs = require('fs')
const baseUrl = 'https://wakatime.com/api/v1'
const stats_api = '/users/current/stats/last_7_days'
const width = 25
// const { WAKATIME_API_KEY: wakatimeApiKey } = process.env
const wakatimeApiKey = '4c3f47cd-d632-4e15-8dd4-796c8f333d01'
const bar_styles = new Map([['default', '░▒▓█']])
const statsUrl = `${baseUrl}${stats_api}?api_key=${wakatimeApiKey}`
const TEXT_PADING = 20
const fetchApi = async () => {
  const { data } = await axios.get(statsUrl)
  // console.log('data=====>', data.data.languages)
  if (data.data.languages) {
    const languages = data.data.languages.sort((a, b) => a.percent - b).slice(0, 5)
    const chart = languages.map((language) => {
      const percent = language.percent
      const bar = bar_styles.get('default')
      const bar_len = bar.length
      const slide_num = Math.floor(100 / width)
      const bar_f_length = Math.floor(percent / slide_num)
      const bar_m_index = Math.floor(((percent % slide_num) / slide_num) * bar_len)
      const bar_r_length = width - bar_f_length - 1
      return (
        language.name.padEnd(TEXT_PADING) +
        ' ' +
        bar[bar_len - 1].repeat(bar_f_length) +
        bar[bar_m_index] +
        bar[0].repeat(bar_r_length) +
        '  ' +
        language.percent +
        '%'
      )
    })
    console.log(chart)
    return chart.join('\n')
  }
}

const update_README = async (wakaTextChart) => {
  let str = fs.readFileSync('./README.md', { encoding: 'utf-8' })
  console.debug(str)
  str = str.replace(
    /(<!--START_SECTION:waka-->\n\n```text\n)([\s\S]+)(\n```\n\n<!--END_SECTION:waka-->)/,
    ($0, $1, $2, $3) => {
      return `${$1}${wakaTextChart}${$3}`
    },
  )
  fs.writeFileSync('./README.md', str)
}

const init = async () => {
  const wakaTextChart = await fetchApi()
  await update_README(wakaTextChart)
}

init()
