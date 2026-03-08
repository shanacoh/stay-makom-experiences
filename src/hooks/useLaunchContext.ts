import { useSearchParams } from "react-router-dom";
import { useCallback } from "react";

export const useLaunchContext = () => {
  const [searchParams] = useSearchParams();
  const isLaunch = searchParams.get("context") === "launch";

  const getLaunchPath = useCallback(
    (path: string) => {
      if (!isLaunch) return path;
      const [pathWithoutHash, hash] = path.split("#");
      const separator = pathWithoutHash.includes("?") ? "&" : "?";
      const withContext = `${pathWithoutHash}${separator}context=launch`;
      return hash ? `${withContext}#${hash}` : withContext;
    },
    [isLaunch]
  );

  return { isLaunch, getLaunchPath };
};
