import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function StaticScreen({ dataFn, renderFn, children, vars = {} }) {
  const [data, setData] = useState(children[0]);

  return renderFn(data, {
    screen: {
      refresh: async () => {
        return setData(children[0]);
      },
      load: async (source, params) => {
        return dataFn(source, params).then(setData);
      },
    },
    ...vars,
  });
}

function Screen({
  dataFn,
  renderFn,
  onLoading,
  onError,
  source,
  params = {},
  deps = [],
  vars = {},
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchData = async (s, p) => {
    setLoading(true);

    return dataFn(s, p)
      .then((data) => {
        setData(data);
        setError(null);
      })
      .catch(setError)
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData(source, params);
  }, [source, ...deps]);

  if (loading) {
    return typeof onLoading === "function" ? onLoading() : null;
  }

  if (error) {
    return typeof onError === "function" ? onError(error) : "Error";
  }

  return renderFn(data, {
    screen: {
      refresh: async () => {
        return fetchData(source, params);
      },
      load: async (source, params) => {
        return dataFn(source, params).then(setData);
      },
    },
    ...vars,
  });
}

function CardScreen({
  source,
  dataFn,
  renderFn,
  idKey = "id",
  vars = {},
  ...props
}) {
  const { id = null } = useParams();

  return (
    <Screen
      dataFn={dataFn}
      renderFn={renderFn}
      source={source}
      params={{ [idKey]: id }}
      deps={[id]}
      vars={vars}
      {...props}
    />
  );
}

function QueryScreen({
  dataFn,
  renderFn,
  source,
  queryMap,
  vars = {},
  ...props
}) {
  const query = useQuery();

  const qqq = Object.fromEntries(
    Object.entries(queryMap || {}).map((i) => {
      const v = query.get(i[0]);
      switch (i[1]) {
        case "integer":
          return [i[0], parseInt(v)];
        default:
          return [i[0], v];
      }
    }),
  );

  return (
    <Screen
      dataFn={dataFn}
      renderFn={renderFn}
      source={source}
      params={qqq}
      deps={Object.values(qqq)}
      vars={{
        query,
        ...vars,
      }}
      {...props}
    />
  );
}

function initModule({ onLoading, onError, datasources: ds }) {
  const datasources = {
    fetch: window.fetch,
    ...ds,
  };

  return {
    name: "screen",
    components: {
      screen: ({ dataFn = "fetch", ...props }, { render }) => (
        <Screen
          dataFn={datasources[dataFn]}
          renderFn={render}
          onLoading={onLoading}
          onError={onError}
          {...props}
        />
      ),
      static_screen: ({ dataFn = "fetch", ...props }, { render, children }) => (
        <StaticScreen dataFn={datasources[dataFn]} renderFn={render} {...props}>
          {children}
        </StaticScreen>
      ),
      card_screen: ({ dataFn = "fetch", ...props }, { render }) => (
        <CardScreen
          dataFn={datasources[dataFn]}
          renderFn={render}
          onLoading={onLoading}
          onError={onError}
          {...props}
        />
      ),
      query_screen: ({ dataFn = "fetch", ...props }, { render }) => (
        <QueryScreen
          dataFn={datasources[dataFn]}
          renderFn={render}
          onLoading={onLoading}
          onError={onError}
          {...props}
        />
      ),
    },
  };
}

export default initModule;
