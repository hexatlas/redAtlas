async function useOverpassAPI(query, url?) {
  const encodedQuery = encodeURIComponent(query);
  const overpassApiUrl = `${url || import.meta.env.VITE_OVERPASS_URL}?data=${encodedQuery}`;

  try {
    const response = await fetch(overpassApiUrl);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const json = await response.json();
    return json;
  } catch (error) {}
}

export default useOverpassAPI;
