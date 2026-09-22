async function handleResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Ocorreu um erro."
    );
  }

  return data;
}

/* ===========================
   LISTAR CLIENTES / MARCAÇÕES
=========================== */

export async function getClients() {
  const response = await fetch(
    "/api/clients"
  );

  return handleResponse(response);
}

/* ===========================
   EDITAR CLIENTE
=========================== */

export async function updateClient({
  originalPhone,
  originalEmail,
  name,
  phone,
  email,
}) {
  const response = await fetch(
    "/api/clients",
    {
      method: "PUT",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        originalPhone,
        originalEmail,
        name,
        phone,
        email,
      }),
    }
  );

  return handleResponse(response);
}

/* ===========================
   ELIMINAR CLIENTE
   E HISTÓRICO
=========================== */

export async function deleteClient({
  originalPhone,
  originalEmail,
}) {
  const response = await fetch(
    "/api/clients",
    {
      method: "DELETE",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        originalPhone,
        originalEmail,
      }),
    }
  );

  return handleResponse(response);
}