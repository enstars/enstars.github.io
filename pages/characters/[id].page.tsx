import { Box, Alert, useMantineTheme, Title, Text } from "@mantine/core";
import Confetti from "react-confetti";
import { IconCake, IconStar } from "@tabler/icons-react";
import { Fragment, createContext, useContext, useState, useMemo } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { Parallax, ParallaxProvider } from "react-scroll-parallax";

import { CirclesSection } from "./components/CirclesSection";
import { CardsSection } from "./components/CardsSection";
import { EventsScoutsSection } from "./components/EventsScoutsSection";
import { UnitSection } from "./components/UnitSection";
import { ProfileSummary } from "./components/ProfileSummary";
import { CharaRender } from "./components/CharaRender";
import { ParallaxCacheUpdater } from "./components/ParallaxCacheUpdater";

import SectionTitle from "pages/events/components/SectionTitle";
import { getLayout } from "components/Layout";
import { QuerySuccess } from "types/makotools";
import getServerSideUser from "services/firebase/getServerSideUser";
import {
  getData,
  getLocalizedDataArray,
  getItemFromLocalizedDataArray,
} from "services/data";
import { useDayjs } from "services/libraries/dayjs";
import {
  GameCard,
  GameCharacter,
  Event,
  Scout,
  GameUnit,
  VersionedCharacterData,
} from "types/game";
import { getNameOrder } from "services/game";
import {
  hexToHSL,
  primaryCharaColor,
  secondaryCharaColor,
} from "services/utilities";
import NameOrder from "components/utilities/formatting/NameOrder";
import { Dayjs } from "dayjs";

const CharacterColorsContext = createContext({
  primary: "",
  secondary: "",
  image: "",
});

export function selectCorrectCharacterVersion() {

}

export const useCharacterColors = () => {
  return useContext(CharacterColorsContext);
};

const differingDataKeys = [
  "ages",
  "heights",
  "hobbies",
  "introductions",
  "quotes",
  "renders.full",
  "specialties",
  "taglines",
  "weights",
];

function Page({
  characterQuery,
  charactersQuery,
  cardsQuery,
  eventsQuery,
  scoutsQuery,
  unitsQuery,
}: {
  characterQuery: QuerySuccess<GameCharacter>;
  charactersQuery: QuerySuccess<GameCharacter[]>;
  cardsQuery: QuerySuccess<GameCard[]>;
  eventsQuery: QuerySuccess<Event[]>;
  scoutsQuery: QuerySuccess<Scout[]>;
  unitsQuery: QuerySuccess<GameUnit[]>;
}) {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(theme.fn.smallerThan("md"));
  const { dayjs } = useDayjs();
  const { data: character } = characterQuery;
  const { data: characters } = charactersQuery;
  const { data: cards } = cardsQuery;
  const { data: events } = eventsQuery;
  const { data: scouts } = scoutsQuery;
  const { data: units } = unitsQuery;
  const [renderFaded, setRenderFaded] = useState(false);

  // get different versions of character data
  const characterVersions: Array<{ date: Dayjs; reason: string; id: number }> =
    useMemo(() => {
      const flattenedRendersData: GameCharacter & {
        "renders.full": Array<VersionedCharacterData<string>>;
      } = {
        ...character,
        "renders.full": character.renders.full,
      }

      const versionedData: [
        string,
        Array<VersionedCharacterData<string[] | string | number>>
      ][] = Object.entries(flattenedRendersData).filter(([key]) =>
        differingDataKeys.includes(key)
      );
   const flattenedVersionedData = versionedData.map(data => data[1]).flat();
   const uniqueVersions = flattenedVersionedData.reduce((acc, current) => {
        const formattedVersionData = {
            date: dayjs(current.date),
            reason: current.reason,
        }
        const doesVersionExistInArray = acc.find(data => data.date.isSame(formattedVersionData.date) || data.reason === formattedVersionData.reason);
        if (!doesVersionExistInArray) {
            const updatedArray = [...acc, formattedVersionData];
            return updatedArray;
        } else {
            return acc;
        }
   }, [] as Array<{date: Dayjs; reason: string}>);

   return uniqueVersions.sort((a, b) => {
    if (a.date.isSameOrBefore(b.date)) return -1;
    else return 1;
   }).map((version, index) => ({
    ...version,
    id: index,
   }));
  }, [character]);

  // create a context for the characters colors
  const [selectedVersionId, setSelectedVersionId] = useState(0);

  const selectedVersion = useMemo(() => {
    return characterVersions[selectedVersionId];
  }, [selectedVersionId]);

  const charaColors = {
    primary: primaryCharaColor(theme, character.image_color),
    secondary: secondaryCharaColor(theme, character.image_color),
    image: character.image_color || "#000000",
  };

  const charaEvents = events.filter((event) => {
    for (let card of event.cards) {
      const cardData = cards.filter((c) => c.id === card)[0];
      if (!cardData) continue;
      if (cardData.character_id === character.character_id) return true;
    }
    return false;
  });

  const charaScouts = scouts.filter((scout) => {
    for (let card of scout.cards) {
      const cardData = cards.filter((c) => c.id === card)[0];
      if (!cardData) continue;
      if (cardData.character_id === character.character_id) return true;
    }
    return false;
  });

  const charaCards = cards.filter(
    (card) => card.character_id === character.character_id
  );

  const renderHeight = isMobile ? 500 : 700;

  if (character.character_id === 74)
    console.log("oh my god niki shiina from ensemble stars");
  if (character.character_id === 13)
    console.log("no way it's makoto yuuki from makotools");

  const hsl = hexToHSL(character.image_color as string);

  const baseColor =
    (theme.colorScheme === "light" &&
      hsl.l < 75 &&
      (hsl.h < 51 || hsl.h > 60)) ||
    (theme.colorScheme === "light" && hsl.h >= 51 && hsl.h <= 60 && hsl.l < 40)
      ? hexToHSL(character.image_color as string).hsl
      : `hsla(${hsl.h - 2 < 0 ? 360 - (hsl.h - 2) : hsl.h - 2}, ${
          hsl.s - 5
        }%, ${hsl.l - 5}%, ${theme.colorScheme === "light" ? 1 : 0.7})`;

  return (
    <CharacterColorsContext.Provider value={charaColors}>
      <ParallaxProvider>
        <ParallaxCacheUpdater />
        {dayjs(character.birthday).year(new Date().getFullYear()).isToday() && (
          <>
            <Confetti
              width={1200}
              height={1000}
              recycle={false}
              style={{ margin: "auto", marginTop: "-10%" }}
            />
            <Alert
              icon={<IconCake />}
              color={theme.primaryColor}
              sx={{ margin: "10px 0px", fontSize: "12pt" }}
            >
              Today is {character.first_name[0]}&apos;s birthday!
            </Alert>
          </>
        )}

        <Box
          id="chara-summary-container"
          pos="relative"
          sx={(theme) => ({
            width: "100%",
            height: 700,
            marginTop: 10,
            minHeight: renderHeight + 50,
            [`@media (max-width: ${theme.breakpoints.md}px)`]: {
              height: "auto",
            },
          })}
        >
          <Box
            id="chara-title-info"
            sx={{
              zIndex: 2,
              position: "absolute",
              [`@media (max-width: ${theme.breakpoints.md}px)`]: {
                position: "relative",
              },
            }}
          >
            <Title
              order={1}
              sx={{
                wordSpacing: "9999rem",
                fontSize: "6rem",
                lineHeight: 1.1,
                marginTop: theme.spacing.xl * 2,
                [`@media (max-width: ${theme.breakpoints.md}px)`]: {
                  fontSize: "3rem",
                },
              }}
            >
              <NameOrder {...character} locale={cardsQuery.lang[0].locale} />
            </Title>
            <Text
              weight={500}
              mt={theme.spacing.xs}
              mb={theme.spacing.lg}
              sx={{
                fontSize: "1.25rem",
                // [`@media (max-width: ${theme.breakpoints.md}px)`]: {
                //   fontSize: "1.25rem",
                // },
              }}
            >
              CV: {character.character_voice[0]}
            </Text>
            <Text
              // weight={700}
              my={theme.spacing.md}
              sx={{
                fontFamily: theme.headings.fontFamily,
                fontSize: "1.5rem",
                maxWidth: "33%",
                display: "flex",
                "&:before": {
                  content: '""',
                  width: 0,
                  height: 0,
                  borderTop: `1em solid ${baseColor}`,
                  borderLeft: `1em solid transparent`,
                  position: "relative",
                  top: "0.3rem",
                  marginRight: theme.spacing.sm,
                },
                [`@media (max-width: ${theme.breakpoints.sm}px)`]: {
                  fontSize: "1rem",
                },
                [`@media (max-width: ${theme.breakpoints.md}px)`]: {
                  maxWidth: "100%",
                  marginRight: "33%",
                  fontSize: "1.15rem",
                },
              }}
            >
              {character.quote[0]}
            </Text>
          </Box>
          {/* {CharaRender(theme, renderFaded, character, renderHeight)} */}
          <CharaRender
            {...{
                theme,
                renderFaded,
                character,
                renderHeight,
                selectedVersion,
            }}
          />
          <ProfileSummary
            character={character}
            renderFaded={renderFaded}
            setRenderFaded={setRenderFaded}
            versionList={characterVersions}
            selectedVersion={selectedVersionId}
            setSelectedVersion={setSelectedVersionId}
          />
          <Box
            id="chara-name-secondaryName"
            pos="absolute"
            sx={{ zIndex: 1, width: "100%", height: "100vh", top: 0 }}
          >
            <Parallax speed={-8}>
              <Box
                sx={{
                  userSelect: "none",
                  position: "absolute",
                  right: "1rem",
                  top: "-6rem",
                  width: "100vw",
                  height: "100vh",
                  fontSize: "4rem",
                  fontWeight: 700,
                  writingMode: "vertical-rl",
                  color:
                    theme.colorScheme === "dark"
                      ? theme.colors.dark[8]
                      : theme.fn.lighten(theme.colors.gray[0], 0.5),
                  textShadow:
                    "var(--text-outline-color) 2px 0px 0px, var(--text-outline-color) 1.75517px 0.958851px 0px, var(--text-outline-color) 1.0806px 1.68294px 0px, var(--text-outline-color) 0.141474px 1.99499px 0px, var(--text-outline-color) -0.832294px 1.81859px 0px, var(--text-outline-color) -1.60229px 1.19694px 0px, var(--text-outline-color) -1.97998px 0.28224px 0px, var(--text-outline-color) -1.87291px -0.701566px 0px, var(--text-outline-color) -1.30729px -1.5136px 0px, var(--text-outline-color) -0.421592px -1.95506px 0px, var(--text-outline-color) 0.567324px -1.91785px 0px, var(--text-outline-color) 1.41734px -1.41108px 0px, var(--text-outline-color) 1.92034px -0.558831px 0px",
                  ["--text-outline-color"]: baseColor,
                }}
              >
                {character.last_name[1]}
                {character.first_name[1]}
              </Box>
            </Parallax>
          </Box>
          <Box
            id="chara-bg"
            pos="absolute"
            sx={{ zIndex: 1, width: "100%", height: "100vh", top: 0 }}
          >
            <Parallax speed={-7.5}>
              <Box
                sx={{
                  width: "44vw",
                  height: "44vw",
                  margin: "auto",
                  marginTop: "-12.2vw",
                  borderRadius: 120,
                  border: `4px solid ${character.image_color}22`,
                  transform: "rotate(45deg)",
                  [`@media (max-width: ${theme.breakpoints.md}px)`]: {
                    width: "50vh",
                    height: "50vh",
                    borderRadius: 75,
                  },
                }}
              />
            </Parallax>
            <Parallax speed={-5}>
              <Box
                sx={{
                  width: "44vw",
                  height: "44vw",
                  margin: "auto",
                  marginTop: "-22vw",
                  borderRadius: 120,
                  backgroundColor: `${character.image_color}22`,
                  transform: "rotate(45deg)",
                  [`@media (max-width: ${theme.breakpoints.md}px)`]: {
                    width: "50vh",
                    height: "50vh",
                    borderRadius: 75,
                    marginTop: "-10vh",
                  },
                }}
              />
            </Parallax>
          </Box>
        </Box>
        <Box sx={{ width: "95%", margin: "auto" }} mt="xl">
          <SectionTitle
            title="Introduction"
            id="introduction"
            Icon={IconStar}
          />
          <Text
            component="p"
            sx={{
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
              fontSize: "1rem",
              "&:before": {
                content: "'“'",
                fontSize: "4.5rem",
                fontFamily: "'Sora', sans serif",
                color: baseColor,
              },
            }}
          >
            {character.introduction[0]}
          </Text>
          <UnitSection
            characters={characters}
            character={character}
            locale={characterQuery.lang}
            units={units}
          />
          <CirclesSection characters={characters} character={character} />
          <CardsSection
            cards={charaCards}
            character={character}
            lang={cardsQuery.lang}
          />
          <EventsScoutsSection
            type="events"
            events={charaEvents}
            cards={charaCards}
          />
          <EventsScoutsSection
            type="scouts"
            events={charaScouts}
            cards={charaCards}
          />
        </Box>
      </ParallaxProvider>
    </CharacterColorsContext.Provider>
  );
}

export const getServerSideProps = getServerSideUser(
  async ({ res, locale, params, db }) => {
    const characters = await getLocalizedDataArray<GameCharacter>(
      "characters",
      locale,
      "character_id"
    );
    const charsEN = await getData<GameCharacter<string>[]>("characters", "en");
    if (!characters || charsEN.status === "error") return { notFound: true };
    const { data: charactersEN } = charsEN;

    if (!params?.id || Array.isArray(params?.id)) return { notFound: true };

    const lastSegment = params?.id?.toLocaleLowerCase();
    const characterID = parseInt(lastSegment, 10);
    const isName = isNaN(characterID);

    const characterEN = charactersEN.find(
      isName
        ? (item) =>
            `${item.last_name} ${item.first_name}`.toLocaleLowerCase() ===
              lastSegment ||
            `${item.first_name} ${item.last_name}`.toLocaleLowerCase() ===
              lastSegment ||
            `${item.first_name}`.toLocaleLowerCase() === lastSegment
        : (item) => item.character_id === characterID
    );

    if (typeof characterEN === "undefined") {
      return {
        notFound: true,
      };
    }

    const character = getItemFromLocalizedDataArray<GameCharacter>(
      characters,
      characterEN.character_id,
      "character_id"
    );

    if (character.status === "error") {
      return {
        notFound: true,
      };
    }

    const characterName = getNameOrder(
      character.data,
      db?.setting__name_order,
      locale
    );

    const breadcrumbs = [
      "characters",
      `${character.data.character_id}[ID]${characterName}`,
    ];

    const cards = await getLocalizedDataArray<GameCard>("cards", locale, "id", [
      "id",
      "name",
      "title",
      "type",
      "rarity",
      "character_id",

      "stats.ir.da",
      "stats.ir.vo",
      "stats.ir.pf",
      "stats.ir4.da",
      "stats.ir4.vo",
      "stats.ir4.pf",
    ]);

    const events = await getLocalizedDataArray<Event>(
      "events",
      locale,
      "event_id"
    );

    const scouts = await getLocalizedDataArray<Scout>(
      "scouts",
      locale,
      "gacha_id"
    );

    const units = await getLocalizedDataArray<GameUnit>("units", locale, "id");

    return {
      props: {
        characterQuery: character,
        charactersQuery: characters,
        cardsQuery: cards,
        eventsQuery: events,
        scoutsQuery: scouts,
        unitsQuery: units,
        breadcrumbs,
        meta: {
          title: characterName,
        },
      },
    };
  }
);
Page.getLayout = getLayout({
  wide: true,
  customWidth: "md",
});
export default Page;
