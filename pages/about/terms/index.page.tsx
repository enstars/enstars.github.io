import { Text, TypographyStylesProvider } from "@mantine/core";
import TermsHTML from "raw-loader!./terms.html";

import PageTitle from "components/sections/PageTitle";
import { getLayout } from "components/Layout";
import useTranslation from "next-translate/useTranslation";

function Page() {
  const { t } = useTranslation("about/terms");
  return (
    <>
      <PageTitle title={t("title")} />
      <Text color="dimmed" my="xs">
        {t("disclaimer")}
      </Text>
      <TypographyStylesProvider>
        <div dangerouslySetInnerHTML={{ __html: TermsHTML }} />
      </TypographyStylesProvider>
    </>
  );
}
Page.getLayout = getLayout({ meta: { title: "Terms of Service", desc: "" } });
export default Page;
