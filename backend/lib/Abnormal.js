export default function checkAbnormality(data) {
    let abnormal = '';

    if (data.oxygen < 5) {
        abnormal += `⚠️ Oxygen level dropped below normal (5 mg/L) to ${data.oxygen} mg/L.<br/>`;
    }
    if (data.nitrogen > 0.1) {
        abnormal += `⚠️ Nitrogen level exceeded safe limit (0.1 mg/L) to ${data.nitrogen} mg/L.<br/>`;
    }
    if (data.phosphorus > 0.1) {
        abnormal += `⚠️ Phosphorus level exceeded safe limit (0.1 mg/L) to ${data.phosphorus} mg/L.<br/>`;
    }
    if (data.temp > 37 || data.temp < 24) {
        abnormal += `🌡️ Temperature out of safe range (24°C - 37°C): Currently ${data.temp}°C.<br/>`;
    }

    return abnormal || "✅ All parameters are within normal range.";
}
