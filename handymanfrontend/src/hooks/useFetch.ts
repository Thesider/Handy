import { useEffect, useState } from "react";

export const useFetch = <T>(fetcher: () => Promise<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetcher()
      .then((response) => {
        if (active) {
          setData(response);
          setError(null);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err?.message ?? "Unable to load data");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [fetcher]);

  return { data, loading, error };
};
