async function handleResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Não foi possível calcular os horários disponíveis."
    );
  }

  return data;
}

export async function getAvailableTimes(date, services) {
  const totalDuration = services.reduce(
    (total, service) =>
      total + Number(service.duration),
    0
  );

  const params = new URLSearchParams({
    date,
    duration: String(totalDuration),
  });

  const response = await fetch(
    `/api/availability?${params.toString()}`
  );

  return handleResponse(response);
}