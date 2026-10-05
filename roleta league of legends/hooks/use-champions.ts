"use client"

import useSWR from "swr"
import { fetchChampions, type DDragonState } from "@/lib/ddragon"

export function useChampions() {
  const { data, error, isLoading } = useSWR<DDragonState>("ddragon-champions", fetchChampions, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  })

  return {
    version: data?.version ?? "",
    champions: data?.champions ?? [],
    isLoading,
    error,
  }
}