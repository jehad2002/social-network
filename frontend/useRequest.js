import useSWR from "swr"

const fetCher = url => fetch(url,{credentials: "include"}).then(res => res.json())
const baseUrl = "http://localhost:8080"

export const useGetData = path => {
  if (!path) {
    throw new Error("Path is required")
  }

  const url = baseUrl + path

  const { data: datas, error } = useSWR(url, fetCher, { refreshInterval: 100 })

  return { datas, error }
}

