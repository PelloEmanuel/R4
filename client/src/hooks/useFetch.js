import { useCallback, useEffect, useState } from 'react';

// Carga datos de la API con estados de carga y error.
export default function useFetch(url) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  const load = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Error al cargar los datos');
      setState({ data: await res.json(), loading: false, error: null });
    } catch (e) {
      setState({ data: null, loading: false, error: e.message });
    }
  }, [url]);

  useEffect(() => { load(); }, [load]);
  return { ...state, retry: load };
}
