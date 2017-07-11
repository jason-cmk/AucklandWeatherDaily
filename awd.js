const config = require('./config')
const fetch = require('node-fetch')
const twit = require('twit')
const emoji = require('node-emoji')

const Twitter = new twit(config.twitter)
const CronJob = require('cron').CronJob

// wunderground info
const wundergroundQuery = '/forecast/q/NZ/Auckland.json'
const wundergroundApiKey = config.wunderground.wundergroundApiKey
const wundergroundUrl =
  'http://api.wunderground.com/api/' +
  wundergroundApiKey +
  wundergroundQuery

const conditionsLookup = {
  clear: 'clear',
  rain: 'rain',
  chanceRain: 'chancerain',
  cloudy: 'cloudy',
  partlyCloudy: 'partlycloudy',
  mostlyCloudy: 'mostlycloudy',
  thunderStorms: 'tstorms',
  chanceThunderStorms: 'chancetstorms',
  fog: 'fog',
  hazy: 'hazy,',
  chanceSleet: 'chancesleet'
}

const dayNames = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
]

const dayEmoji = emoji.get('sunrise')
const nightEmoji = emoji.get('night_with_stars')

function main() {
  fetch(wundergroundUrl)
    .then(response => response.json())
    .then(parsedResponse => tweetWeather(parsedResponse))
}

tweetWeather = (data) => {
  const dayConditions = data.forecast.txt_forecast.forecastday[0].icon
  const nightConditions = data.forecast.txt_forecast.forecastday[1].icon
  const today = new Date()

  dayConditionEmoji = getEmojifiedCondition(dayConditions)
  nightConditionEmoji = getEmojifiedCondition(nightConditions.slice(3)) // night conditions are prefixed with "nt_"

  tweet = dayEmoji + '  ' + dayConditionEmoji + '\n' +
    nightEmoji + '  ' + nightConditionEmoji + '\n\n' +
    dayNames[today.getDay() + 1] // NZ time is a day ahead of GMT

  Twitter.post('statuses/update', {
    status: tweet
  }, (err, data, response) => {
    console.log('###### RESPONSE')
    console.log(response)
    if (err !== undefined) {
      console.log('###### ERRORS')
      console.log(err)
    }
  })

  console.log(tweet)
}

getEmojifiedCondition = (conditions) => {
  switch (conditions) {
    case conditionsLookup.clear:
      return emoji.get('sunny')
      break

    case conditionsLookup.rain:
    case conditionsLookup.chanceRain:
      return emoji.get('rain_cloud')
      break

    case conditionsLookup.thunderStorms:
    case conditionsLookup.chanceThunderStorms:
      return emoji.get('lightning_cloud')
      break

    case conditionsLookup.fog:
    case conditionsLookup.hazy:
      return emoji.get('fog')
      break

    case conditionsLookup.chanceSleet:
      return emoji.get('snowflake')
      break

    case conditionsLookup.cloudy:
      return emoji.get('cloud')
      break

    case conditionsLookup.mostlyCloudy:
      return emoji.get('barely_sunny')
      break

    case conditionsLookup.partlyCloudy:
      return emoji.get('mostly_sunny')
      break
  }
  return '¯\\_(ツ)_/¯'
}

const cronJob = new CronJob(
  '00 30 17 * * *',
  main,
  console.log('Job completed: ' + new Date()),
  true)

cronJob.start()
console.log('CronJob Status:', cronJob.running);
