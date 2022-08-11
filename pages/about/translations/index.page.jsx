import { TypographyStylesProvider } from "@mantine/core";

import Layout from "../../../components/Layout";
import PageTitle from "../../../components/PageTitle";
import { MAKOTOOLS } from "../../../services/constants";

function Page() {
  return (
    <>
      <PageTitle title="About Translations"></PageTitle>
      <TypographyStylesProvider>
        <p>
          MakoTools contains translated content both from volunteers, and from
          official sources.
        </p>
        <p>
          Volunteer translations (unofficial / fan translations) are not
          approved by Happy Elements, and are not official content.
          Additionally, these may be different from official translations used
          in official media, or in-game.
        </p>
        <h2>Incorrect Translations</h2>
        <p>
          If you believe any of the unofficial translations on this website are
          incorrect, feel free to contact us at{" "}
          <a href={MAKOTOOLS.EMAIL}>{MAKOTOOLS.EMAIL}</a>.
        </p>
        <p>
          We cannot provide help for incorrect official translations. In those
          cases, we recommend you contact Happy Elements directly yourself.
        </p>
      </TypographyStylesProvider>
    </>
  );
}

export default Page;

Page.getLayout = function getLayout(page, pageProps) {
  return <Layout pageProps={pageProps}>{page}</Layout>;
};
