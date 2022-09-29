# Hong Kong Holiday check 

## install dependences
npm -i 

### check today 
./holiday 

### check YYYY-MM-DD ( within one year before or near future )  
./holiday 2022-10-04

### check for 10th of this month
./holiday 10

### check for 5 days ago
./holiday -5

### Params (as environment variables) 

HOLIDAYFILE : local cache file , default = "./.holiday.cache.json"

GOVAPI : online source , default = "https://www.1823.gov.hk/common/ical/en.json"

### 轉用繁體中文版
GOVAPI="https://www.1823.gov.hk/common/ical/tc.json" ./holiday 2022-10-04

