import React from "react";
import { Screen, CardScreen, QueryScreen } from "./components";

// TODO implement
function useFetch() {
  return {
    data: {},
    loading: false,
    error: null,
    refetch: () => {},
  };
}

function initModule({ onLoading, onError, datasources: ds }) {
  const datasources = {
    useFetch,
    ...ds,
  };

  return {
    name: "screen",
    components: {
      screen: ({ dataFn = "useFetch", ...props }, { render }) => (
        <Screen
          dataFn={datasources[dataFn]}
          renderFn={render}
          onLoading={onLoading}
          onError={onError}
          {...props}
        />
      ),
      card_screen: ({ dataFn = "useFetch", ...props }, { render }) => (
        <CardScreen
          dataFn={datasources[dataFn]}
          renderFn={render}
          onLoading={onLoading}
          onError={onError}
          {...props}
        />
      ),
      query_screen: ({ dataFn = "useFetch", ...props }, { render }) => (
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
