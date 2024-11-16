interface Resources {
  "translation": {
    "navigation": {
      "home": "Home",
      "devices": "Devices",
      "history": "History"
    },
    "pages": {
      "error": {
        "an unexpected error has occurred": "An unexpected error has occurred.",
        "unknown error": "Unknown error"
      },
      "login": {
        "login with": "Login with {{protocol}}"
      },
      "devices": {
        "search for devices": "Search for devices",
        "empty": "No devices.",
        "filtered_one": "Filtered {{count}} device.",
        "filtered_other": "Filtered {{count}} devices."
      }
    },
    "common": {
      "close": "Close",
      "clear search": "Clear search",
      "never": "Never",
      "datetime": {
        "date": "{{time, datetime(dateStyle: long; timeStyle: long;}}",
        "relative": {
          "second": "{{time, relativetime(seconds)}}",
          "minute": "{{time, relativetime(minutes)}}",
          "hour": "{{time, relativetime(hours)}}",
          "day": "{{time, relativetime(days)}}",
          "week": "{{time, relativetime(weeks)}}",
          "month": "{{time, relativetime(months)}}",
          "year": "{{time, relativetime(years)}}"
        }
      },
      "power on": "Power {{device}} on",
      "power off": "Power {{device}} off",
      "history link": "Show history for {{device}}",
      "capability": {
        "button": "Show capabilities for {{device}}",
        "brightness": "Set brightness for {{device}}"
      },
      "units": {
        "percentage": "{{value}}%"
      }
    }
  }
}

export default Resources;