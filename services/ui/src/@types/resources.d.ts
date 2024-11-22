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
        "unknown floor": "Floor \"{{floor}}\" is not present in the floor plan.",
        "empty": "No floor plan."
      },
      "devices": {
        "search for devices": "Search for devices",
        "empty": "No devices.",
        "filtered_one": "Filtered {{count, number}} device.",
        "filtered_other": "Filtered {{count, number}} devices."
      },
      "settings": {
        "units": "Units"
      }
    },
    "common": {
      "close": "Close",
      "clear search": "Clear search",
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
          "watt hours": "{{value, number}} Wh",
          "kilowatt hours": "{{value, number}} kWh",
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
          "watt hours": "Watt Hours",
          "kilowatt hours": "Kilowatt Hours",
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
