async function handleResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Ocorreu um erro."
    );
  }

  return data;
}

export async function getServices() {
  const response = await fetch("/api/services");

  return handleResponse(response);
}

export async function createService(service) {
  const response = await fetch("/api/services", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(service),
  });

  return handleResponse(response);
}

export async function updateService(id, service) {
  const response = await fetch("/api/services", {
    method: "PUT",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      id,
      ...service,
    }),
  });

  return handleResponse(response);
}

export async function deleteService(id) {
  const response = await fetch("/api/services", {
    method: "DELETE",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      id,
    }),
  });

  return handleResponse(response);
}