import { useRouter } from "next/router";
import React, { useContext, useEffect } from "react";

import { dayjsLocales } from "./locales";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import localeData from "dayjs/plugin/localeData";

const DayjsContext = React.createContext();
export const useDayjs = () => useContext(DayjsContext);

function DayjsProvider({ children }) {
  const router = useRouter();
  const locale = router.locale || "en";
  dayjsLocales[locale]();
  dayjs.locale(locale);
  dayjs.extend(LocalizedFormat);
  dayjs.extend(localeData);

  return (
    <DayjsContext.Provider value={dayjs}>{children}</DayjsContext.Provider>
  );
}

export default DayjsProvider;