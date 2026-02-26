#!/bin/bash
set -e

scriptPath=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
source "$scriptPath/services_utils.sh"

promote_service() {
    local chartPath="$scriptPath/../../kubernetes/charts/$SERVICE_CHART/Chart.yaml"

    get_chart_versions "$chartPath"

    if is_rc_version "$CHART_APP_VERSION"
    then
        echo "Promoting $SERVICE_CHART: $CHART_APP_VERSION -> $(strip_rc_suffix "$CHART_APP_VERSION")"
        bash "$scriptPath/version.sh" --service "$SERVICE_NAME" --type release --chart-version patch --commit
    else
        echo "Skipping $SERVICE_CHART - version $CHART_APP_VERSION is not RC"
    fi
}

promote_from_yaml() {
    if [ "$SERVICE_CHART" != "null" ] && [ "$SERVICE_CHART" != "~" ]
    then
        promote_service
    fi
}

echo "Promoting RC versions to release..."
foreach_service promote_from_yaml
echo "Done."
