const config = require('./config')
const fetch = require('node-fetch')
const twit = require('twit')
const emoji = require('node-emoji')

const Twitter = new twit(config.twitter);

// Wunderground info
const wunderGroundQuery = '/forecast/q/NZ/Auckland.json'
const wunderGroundApiKey = config.wunderground.wunderGroundApiKey
const wunderGroundUrl =
  'http://api.wunderground.com/api/' +
  wunderGroundApiKey +
  wunderGroundQuery

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

const dayEmoji = emoji.get('sunrise')
const nightEmoji = emoji.get('night_with_stars')
const dayTimeLength = 1000 * 60 * 60 * 24

main () => {
    fetch(wunderGroundUrl)
      .then(response => response.json())
      .then(parsedResponse => tweetWeather(parsedResponse))
    setTimeout(main, dayTimeLength)
}

tweetWeather = (data) => {
  const dayConditions = data.forecast.txt_forecast.forecastday[0].icon
  const nightConditions = data.forecast.txt_forecast.forecastday[1].icon

  dayConditionEmoji = getEmojifiedCondition(dayConditions)
  nightConditionEmoji = getEmojifiedCondition(nightConditions.slice(3)) // night conditions are prefixed with "nt_"

  tweet = dayEmoji + '  ' + dayConditionEmoji + '\n\n' +
    nightEmoji + '  ' + nightConditionEmoji

  Twitter.post('statuses/update', {
    status: tweet
  }, (err, data, response) => {
    console.log(tweet)
  })
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
  return ' dunno mate ¯\\\_(ツ)_/¯'
}
