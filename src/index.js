import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const APPEND_CHILD_COMPONENT_NAME = "append_child";

function StaticScreen({ dataFn, renderFn, children, vars = {} }) {
  const [data, setData] = useState(children[0]);

  return renderFn(data, {
    ...vars,
    screen: {
      refresh: async () => {
        return setData(children[0]);
      },
      load: async (source, params) => {
        return dataFn(source, params).then((data1) => {
          if (data1.type === APPEND_CHILD_COMPONENT_NAME) {
            return setData({
              module: "react",
              type: "fragment",
              children: [data, ...data1.children],
            });
          }

          setData(data1);
        });
      },
    },
  });
}

function Screen({
  dataFn,
  renderFn,
  onLoading,
  onError,
  source,
  hideSpinner,
  params = {},
  deps = [],
  vars = {},
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const initData = useRef(null);

  const fetchData = async (s, p) => {
    setLoading(true);

    return dataFn(s, p)
      .then((data) => {
        setData(data);
        initData.current = data;
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
    return typeof onLoading === "function" && !hideSpinner ? onLoading() : null;
  }

  if (error) {
    return typeof onError === "function" ? onError(error) : "Error";
  }

  return renderFn(data, {
    ...vars,
    screen: {
      refresh: async () => {
        return setData(initData.current);
      },
      load: async (source, params) => {
        return dataFn(source, params).then((data1) => {
          if (data1.type === APPEND_CHILD_COMPONENT_NAME) {
            return setData({
              module: "react",
              type: "fragment",
              children: [data, ...data1.children],
            });
          }

          setData(data1);
        });
      },
    },
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
    })
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
    fetch,
    ...ds,
  };

  return {
    name: "screen",
    components: {
      screen: (
        { dataFn = "fetch", params = {}, key, ...props },
        { render }
      ) => (
        <Screen
          key={key}
          dataFn={datasources[dataFn]}
          renderFn={render}
          onLoading={onLoading}
          onError={onError}
          params={params}
          deps={JSON.stringify(params)}
          {...props}
        />
      ),
      static_screen: (
        { dataFn = "fetch", key, ...props },
        { render, children }
      ) => (
        <StaticScreen
          key={key}
          dataFn={datasources[dataFn]}
          renderFn={render}
          {...props}
        >
          {children}
        </StaticScreen>
      ),
      card_screen: ({ dataFn = "fetch", key, ...props }, { render }) => (
        <CardScreen
          key={key}
          dataFn={datasources[dataFn]}
          renderFn={render}
          onLoading={onLoading}
          onError={onError}
          {...props}
        />
      ),
      query_screen: ({ dataFn = "fetch", key, ...props }, { render }) => (
        <QueryScreen
          key={key}
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
