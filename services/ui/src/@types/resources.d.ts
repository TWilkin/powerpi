interface Resources {
  "defaults": {
    "units": {
      "temperature": "°C",
      "gas": "m3"
    }
  },
  "translation": {
    "navigation": {
      "home": "Home",
      "devices": "Devices",
      "history": "History",
      "settings": "Settings"
    },
    "pages": {
      "error": {
        "an unexpected error has occurred": "An unexpected error has occurred.",
        "unknown error": "Unknown error"
      },
      "login": {
        "login with": "Login with {{protocol}}"
      },
      "home": {
        "unknown": "Floor \"{{value}}\" is not present in the floor plan.",
        "empty": "No floor plan.",
        "more devices": "There are {{count, number}} more hidden devices/sensors."
      },
      "devices": {
        "search for devices": "Search for devices",
        "empty": "No devices.",
        "filtered_one": "Filtered {{count, number}} device.",
        "filtered_other": "Filtered {{count, number}} devices.",
        "filters": {
          "types": "Types",
          "locations": "Locations",
          "visibility": {
            "label": "Visibility",
            "option": "Only show visible devices"
          }
        }
      },
      "history": {
        "headings": {
          "type": "Type",
          "entity": "Entity",
          "action": "Action",
          "when": "When",
          "message": "Message"
        },
        "empty": "No history.",
        "filtered_one": "Filtered {{count, number}} record.",
        "filtered_other": "Filtered {{count, number}} records.",
        "filters": {
          "path": "Path",
          "types": "Types",
          "entities": "Entities",
          "actions": "Actions"
        }
      },
      "settings": {
        "units": "Units"
      }
    },
    "common": {
      "loading": "Loading",
      "close": "Close",
      "clear search": "Clear search",
      "clear filters": "Clear Filters",
      "open filter": "Open filters",
      "close filter": "close filters",
      "all": "All",
      "unspecified": "Unspecified",
      "never": "never",
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
      "lock on": "Unlock {{device}}",
      "lock off": "Lock {{device}}",
      "history link": "Show history for {{device}}",
      "capability": {
        "button": "Show capabilities for {{device}}",
        "brightness": "Set brightness for {{device}}",
        "colour temperature": "Set colour temperature for {{device}}",
        "stream": "Set the stream to play on {{device}}"
      },
      "units": {
        "values": {
          "percentage": "{{value, number}}%",
          "milliampere": "{{value, number}} mA",
          "ampere": "{{value, number}} A",
          "millivolt": "{{value, number}} mV",
          "volt": "{{value, number}} V",
          "watt hours": "{{value, number}} Wh",
          "kilowatt hours": "{{value, number}} kWh",
          "watt": "{{value, number}} W",
          "kilowatt": "{{value, number}} kW",
          "celsius": "{{value, number}} °C",
          "kelvin": "{{value, number}} K",
          "fahrenheit": "{{value, number}} F",
          "metres cubed": "{{value, number}} m³",
          "cubic feet": "{{value, number}} cf",
          "hundred cubic feet": "{{value, number}} hcf",
          "unrecognised": "{{value, number}} {{unit}}"
        },
        "labels": {
          "percentage": "Percentage",
          "milliampere": "Milliampere",
          "ampere": "Ampere",
          "millivolt": "Millivolt",
          "volt": "Volt",
          "watt hours": "Watt Hours",
          "kilowatt hours": "Kilowatt Hours",
          "watt": "Watt",
          "kilowatt": "Kilowatt",
          "celsius": "Celsius",
          "kelvin": "Kelvin",
          "fahrenheit": "Fahrenheit",
          "metres cubed": "Metres Cubed",
          "cubic feet": "Cubic Feet",
          "hundred cubic feet": "Hundred Cubic Feet"
        }
      },
      "sensors": {
        "labels": {
          "door": "Door",
          "electricity": "Electricity",
          "gas": "Gas",
          "humidity": "Humidity",
          "motion": "Motion",
          "switch": "Switch",
          "temperature": "Temperature",
          "window": "Window"
        },
        "states": {
          "detected": "detected",
          "undetected": "undetected",
          "open": "open",
          "close": "closed"
        }
      }
    }
  }
}

export default Resources;
