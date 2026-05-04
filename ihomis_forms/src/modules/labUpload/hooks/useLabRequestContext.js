import { useEffect, useState } from "react";
import { fetchLabRequestContext } from "../api/labUploadApi.js";
import { defaultRequestContext } from "../labUploadConfig.js";
import { mergeRequestContext } from "../utils/labUploadUtils.js";

function useLabRequestContext({ contextUrl, token, contextParams }) {
  const [requestContext, setRequestContext] = useState(defaultRequestContext);
  const [contextLoading, setContextLoading] = useState(Boolean(contextUrl));
  const [contextError, setContextError] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadRequestContext() {
      if (!contextUrl) {
        setContextLoading(false);
        setContextError(false);
        return;
      }

      setContextLoading(true);
      setContextError(false);

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

        setContextError(true);
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
    setRequestContext((currentContext) =>
      mergeRequestContext(currentContext, nextContext),
    );
    setContextError(false);
  }

  return {
    requestContext,
    contextLoading,
    contextError,
    applyContextFromApi,
  };
}

export default useLabRequestContext;
