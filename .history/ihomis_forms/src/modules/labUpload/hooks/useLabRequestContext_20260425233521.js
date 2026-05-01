import { useEffect, useState } from "react";
import { fetchLabRequestContext } from "../api/labUploadApi.js";
import { defaultRequestContext } from "../labUploadConfig.js";
import { mergeRequestContext } from "../utils/labUploadUtils.js";

function useLabRequestContext({ contextUrl, token, contextParams }) {
  const [requestContext, setRequestContext] = useState(defaultRequestContext);
  const [contextLoading, setContextLoading] = useState(Boolean(contextUrl));

  useEffect(() => {
    let isActive = true;

    async function loadRequestContext() {
      if (!contextUrl) {
        setContextLoading(false);
        return;
      }

      setContextLoading(true);

      try {
        const response = await fetchLabRequestContext({
          contextUrl,
          token,
          contextParams,
        });

        if (!isActive) {
          return;
        }

        setRequestContext((currentContext) =>
          mergeRequestContext(currentContext, response.requestContext),
        );
      } catch {
        if (!isActive) {
          return;
        }
      } finally {
        if (isActive) {
          setContextLoading(false);
        }
      }
    }

    loadRequestContext();

    return () => {
      isActive = false;
    };
  }, [contextParams, contextUrl, token]);

  function applyContextFromApi(nextContext) {
    if (!nextContext?.hasAnyContext) {
      return;
    }

    setRequestContext((currentContext) =>
      mergeRequestContext(currentContext, nextContext),
    );
  }

  return {
    requestContext,
    contextLoading,
    applyContextFromApi,
  };
}

export default useLabRequestContext;
