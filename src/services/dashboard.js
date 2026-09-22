async function handleResponse(
  response
) {
  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Não foi possível carregar o Dashboard."
    );
  }

  return data;
}

export async function getDashboardData() {
  const response = await fetch(
    "/api/dashboard"
  );

  return handleResponse(
    response
  );
}