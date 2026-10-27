interface Resources {
  "defaults": {
    "units": {
      "current": "A",
      "electricalPotential": "V",
      "gas": "m3",
      "power": "W",
      "temperature": "°C"
    }
  },
  "translation": {
    "common": {
      "all": "All",
      "capability": {
        "brightness": "Set brightness for {{device}}",
        "button": "Show capabilities for {{device}}",
        "colour temperature": "Set colour temperature for {{device}}",
        "stream": "Set the stream to play on {{device}}"
      },
      "clear filters": "Clear Filters",
      "clear search": "Clear search",
      "close": "Close",
      "close filter": "close filters",
      "datetime": {
        "date": "{{time, datetime(dateStyle: long; timeStyle: long;}}",
        "relative": {
          "day": "{{time, relativetime(days)}}",
          "hour": "{{time, relativetime(hours)}}",
          "minute": "{{time, relativetime(minutes)}}",
          "month": "{{time, relativetime(months)}}",
          "second": "{{time, relativetime(seconds)}}",
          "week": "{{time, relativetime(weeks)}}",
          "year": "{{time, relativetime(years)}}"
        }
      },
      "history link": "Show history for {{device}}",
      "loading": "Loading",
      "lock off": "Lock {{device}}",
      "lock on": "Unlock {{device}}",
      "never": "never",
      "open filter": "Open filters",
      "power off": "Power {{device}} off",
      "power on": "Power {{device}} on",
      "sensors": {
        "labels": {
          "current": "Current",
          "door": "Door",
          "electricalPotential": "Electrical Potential",
          "electricity": "Electricity",
          "gas": "Gas",
          "humidity": "Humidity",
          "motion": "Motion",
          "power": "Power",
          "switch": "Switch",
          "temperature": "Temperature",
          "window": "Window"
        },
        "states": {
          "close": "closed",
          "detected": "detected",
          "open": "open",
          "undetected": "undetected"
        }
      },
      "units": {
        "labels": {
          "ampere": "Ampere",
          "celsius": "Celsius",
          "cubic feet": "Cubic Feet",
          "fahrenheit": "Fahrenheit",
          "hundred cubic feet": "Hundred Cubic Feet",
          "joule": "Joule",
          "kelvin": "Kelvin",
          "kilojoule": "Kilojoule",
          "kilowatt": "Kilowatt",
          "kilowatt hours": "Kilowatt Hours",
          "metres cubed": "Metres Cubed",
          "milliampere": "Milliampere",
          "millivolt": "Millivolt",
          "percentage": "Percentage",
          "thousand cubic feet": "Thousand Cubic Feet",
          "volt": "Volt",
          "watt": "Watt",
          "watt hours": "Watt Hours"
        },
        "values": {
          "ampere": "{{value, number}} A",
          "celsius": "{{value, number}} °C",
          "cubic feet": "{{value, number}} cf",
          "fahrenheit": "{{value, number}} F",
          "hundred cubic feet": "{{value, number}} hcf",
          "joule": "{{value, number}} J",
          "kelvin": "{{value, number}} K",
          "kilojoule": "{{value, number}} kJ",
          "kilowatt": "{{value, number}} kW",
          "kilowatt hours": "{{value, number}} kWh",
          "metres cubed": "{{value, number}} m³",
          "milliampere": "{{value, number}} mA",
          "millivolt": "{{value, number}} mV",
          "percentage": "{{value, number}}%",
          "thousand cubic feet": "{{value, number}} Mcf",
          "unrecognised": "{{value, number}} {{unit}}",
          "volt": "{{value, number}} V",
          "watt": "{{value, number}} W",
          "watt hours": "{{value, number}} Wh"
        }
      },
      "unspecified": "Unspecified"
    },
    "navigation": {
      "devices": "Devices",
      "history": "History",
      "home": "Home",
      "settings": "Settings"
    },
    "pages": {
      "devices": {
        "empty": "No devices.",
        "filtered_one": "Filtered {{count, number}} device.",
        "filtered_other": "Filtered {{count, number}} devices.",
        "filters": {
          "locations": "Locations",
          "types": "Types",
          "visibility": {
            "label": "Visibility",
            "option": "Only show visible devices"
          }
        },
        "search for devices": "Search for devices"
      },
      "error": {
        "an unexpected error has occurred": "An unexpected error has occurred.",
        "unknown error": "Unknown error"
      },
      "history": {
        "empty": "No history.",
        "filtered_one": "Filtered {{count, number}} record.",
        "filtered_other": "Filtered {{count, number}} records.",
        "filters": {
          "actions": "Actions",
          "entities": "Entities",
          "path": "Path",
          "types": "Types"
        },
        "headings": {
          "action": "Action",
          "entity": "Entity",
          "message": "Message",
          "type": "Type",
          "when": "When"
        }
      },
      "home": {
        "empty": "No floor plan.",
        "more devices": "There are {{count, number}} more hidden devices/sensors.",
        "unknown": "Floor \"{{value}}\" is not present in the floor plan."
      },
      "login": {
        "login with": "Login with {{protocol}}"
      },
      "settings": {
        "language": "Language",
        "units": "Units"
      }
    }
  }
}

export default Resources;
