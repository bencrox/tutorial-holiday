const { promises: Fs } = require('fs')
const DAY = require('dayjs')
const HOLIDAYFILE = process.env.HOLIDAYFILE || "./.holiday.cache.json"
const GOVAPI = process.env.GOVAPI || "https://www.1823.gov.hk/common/ical/en.json"
const CYANCOLOR = "\x1b[35m"
const YELLOWCOLOR = "\x1b[33m"
const RESUMENORMAL = "\x1b[0m"

let today = DAY()
let holidays 

/* Check if local cache of holiday data file exist and up to date */

const loadLocal = async (FILENAME) => {
  try {
  	await Fs.access(FILENAME)
	holidays = JSON.parse(await Fs.readFile(FILENAME))
	let lastholiday = holidays.reverse()[0].date
	return lastholiday > today.format('YYYYMMDD')
  }	catch {
  	return false
  }
}

/* Fetch holiday data file from government, and check if the format is recognisable */

const fetchFromGov = async (APIPATH) => {
  const res = await fetch(APIPATH)
  let raw_data = await res.text()
  let parsed_data = JSON.parse(raw_data)
  holidays = parsed_data.vcalendar[0].vevent
    .map(e=>{return {date:e.dtstart[0],summary:e.summary}})
  Fs.writeFile(HOLIDAYFILE,JSON.stringify(holidays),{encoding:'utf8'},(e)=>{
	throw(`Fetch and Save error. File path: ${HOLIDAYFILE} \t error: ${e}`)})
  console.log( CYANCOLOR + "Saved from API: " + APIPATH + YELLOWCOLOR + "\t cache file: "+ HOLIDAYFILE +  RESUMENORMAL ) 
}

let target = today

/* If parameter is provided, construct a date to be checked instead of checking for today */ 

if(process.argv[2]){
        const fitday =(d,s)=>{
                if(isNaN(s)){
                        if(s.match(/\d\d\d\d-\d\d\-\d\d/)){
                                return DAY(s,'YYYY-MM-DD')
                        }else{
                                throw("Unsupported Argument format, expect 'YYYY-MM-DD' or 'DD' or '-{n}' or empty (default = today).")
                        }
                }else {
                        s = parseInt(s,10)
                        if(s < 0){
                                return d.add(s,'day')
                        }else{
                                return d.startOf('month').add(s-1,'day')
                        }
                }
        }

        target = fitday(target,process.argv[2])
}

let main = async () => {
  let local = await loadLocal(HOLIDAYFILE)
  if(!local || process.env.GOVAPI)  
	await fetchFromGov(GOVAPI)
  /* Check if the day is a holiday, if yes, return the holiday summary */

  const holiday_check = (yyyymmdd) => holidays?.filter((e)=>(e.date === yyyymmdd))?.[0]?.summary

  let special = holiday_check(target.format('YYYYMMDD'))
  switch(true){
	case !!special:
	case (target.day() === 0):
		console.log(`It is ${special || 'Sunday'}, have a nice day 😀`)
		break
	case (target.day() === 6):
		console.log("It is Saturday. Take some good rest 😴")
		break
	default:
		console.log("Work work work... 🥱")
  }
}

main()  

