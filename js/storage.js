export function savePreferences(prefs) {
  localStorage.setItem("weatherPreferences", JSON.stringify(prefs));
}

export function loadPreferences() {
  const data = localStorage.getItem("weatherPreferences");
  return data ? JSON.parse(data) : { city: "London" };
}
