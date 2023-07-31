import React from "react";
import { useParams, useLocation } from "react-router-dom";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export function Screen({
  dataFn,
  renderFn,
  onLoading,
  onError,
  source,
  params = {},
  deps = [],
  vars = {},
}) {
  const {
    loading,
    error,
    data = {},
    refetch,
  } = dataFn(source, params, [...deps, source]);

  if (loading) {
    return typeof onLoading === "function" ? onLoading() : null;
  }

  if (error) {
    return typeof onError === "function" ? onError(error) : "Error";
  }

  return renderFn(data, {
    refetch,
    ...vars,
  });
}

// export function SimpleScreen({ source, vars = {} }) {
//   return <Screen source={source} vars={vars} />;
// }

export function CardScreen({
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

export function QueryScreen({
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
