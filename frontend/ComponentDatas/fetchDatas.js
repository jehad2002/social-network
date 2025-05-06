import { urlBase } from "@/utils/url";

export async function fetchDatas(endpoint) {
  try {
    const response = await fetch(urlBase + endpoint, {
      credentials: "include"
    });
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.log(error);
  }
}

export async function fetchWithBody(endpoint, body) {
  try {
    const response = await fetch(`${urlBase + endpoint}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: body
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
}

export async function fetcherSwr(url) {
  const response = await fetch(url, {
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }

  return response.json();
}