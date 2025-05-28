import React, { useContext } from 'react';
import { AtlasContext } from '../../routes/__root';
import { useQuery } from '@tanstack/react-query';

function LocalWeather() {
  const { map, activeAdministrativeRegion } = useContext(AtlasContext)!;
  console.log(map);

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${activeAdministrativeRegion['country']}&units=metric&appid=${
    import.meta.env.VITE_OPENWEATHER_API_KEY
  }`;

  async function getWeather() {
    const response = await fetch(url);
    return await response.json();
  }

  const { data: localWeather, isLoading } = useQuery({
    queryKey: [`weather-${activeAdministrativeRegion['id']}`],
    queryFn: () => getWeather(),
    staleTime: Infinity,
    refetchInterval: false,
    refetchOnMount: false,
  });
  console.log(localWeather);

  return (
    <>
      {isLoading ? (
        <div className="loading">🔎</div>
      ) : (
        <div>{localWeather?.main?.temp} °C</div>
      )}
    </>
  );
}

export default LocalWeather;
