import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Center,
  createStyles,
  Divider,
  MediaQuery,
  SegmentedControl,
  Text,
} from "@mantine/core";
import { IconCalendar, IconList } from "@tabler/icons-react";
import useTranslation from "next-translate/useTranslation";

import CalendarGridView from "./components/CalendarGridView";
import CalendarListView from "./components/CalendarListView";
import CalendarHeader from "./components/CalendarHeader";

import { getLayout } from "components/Layout";
import { useDayjs } from "services/libraries/dayjs";
import getServerSideUser from "services/firebase/getServerSideUser";
import { getLocalizedDataArray } from "services/data";
import { createBirthdayData } from "services/campaigns";
import { GameCharacter, Event, Scout, Birthday } from "types/game";
import { QuerySuccess } from "types/makotools";
import useUser from "services/firebase/user";

/**
 * If the user is viewing from a mobile phone, the default view should be the list view. Otherwise, it should be the traditional calendar.
 */

const useStyles = createStyles((theme, _params, getRef) => ({
  calendar: {
    maxWidth: "100%",
  },
}));

function Page({
  charactersQuery,
  gameEventsQuery,
  scoutsQuery,
}: {
  charactersQuery: QuerySuccess<GameCharacter[]>;
  gameEventsQuery: QuerySuccess<Event[]>;
  scoutsQuery: QuerySuccess<Scout[]>;
}) {
  const { t } = useTranslation("calendar");
  const { classes } = useStyles();
  const { dayjs } = useDayjs();
  const { userDB } = useUser();

  const characters: GameCharacter[] = useMemo(
    () => charactersQuery.data,
    [charactersQuery.data]
  );
  const gameEvents: Event[] = useMemo(
    () => gameEventsQuery.data,
    [gameEventsQuery.data]
  );
  const scouts: Scout[] = useMemo(() => scoutsQuery.data, [scoutsQuery.data]);

  const birthdays: Birthday[] = createBirthdayData(
    characters,
    userDB?.setting__name_order || "firstlast",
    charactersQuery.lang[0].locale
  );

  const events = [...birthdays, ...gameEvents, ...scouts].filter(
    (event) => event.start
  );

  const [calendarTime, setCalendarTime] = useState<string>(dayjs().format());

  const [view, setView] = useState<string>("cal");
  const [, changeShowViewOptions] = useState<boolean>(true);

  useEffect(() => {
    window.innerWidth < 900 ? setView("list") : setView("cal");
    window.innerWidth < 900
      ? changeShowViewOptions(false)
      : changeShowViewOptions(true);
  }, []);

  return (
    <>
      <MediaQuery
        largerThan="sm"
        styles={{
          display: "none",
        }}
      >
        <SegmentedControl
          fullWidth
          my="xs"
          value={view}
          onChange={setView}
          data={[
            {
              label: (
                <Center>
                  <IconCalendar size={16} />
                  <Text ml="xs">{t("calendar.month")}</Text>
                </Center>
              ),
              value: "cal",
            },
            {
              label: (
                <Center>
                  <IconList size={16} />
                  <Text ml="xs">{t("calendar.day")}</Text>
                </Center>
              ),
              value: "list",
            },
          ]}
        />
      </MediaQuery>
      <Box className={classes.calendar}>
        <CalendarHeader
          {...{
            calendarTime,
            setCalendarTime,
            events,
          }}
        >
          <MediaQuery
            smallerThan="sm"
            styles={{
              display: "none",
            }}
          >
            <SegmentedControl
              value={view}
              onChange={setView}
              data={[
                {
                  label: (
                    <Center>
                      <IconCalendar size={16} />
                      <Text ml="xs">{t("calendar.month")}</Text>
                    </Center>
                  ),
                  value: "cal",
                },
                {
                  label: (
                    <Center>
                      <IconList size={16} />
                      <Text ml="xs">{t("calendar.day")}</Text>
                    </Center>
                  ),
                  value: "list",
                },
              ]}
            />
          </MediaQuery>
        </CalendarHeader>
        <Divider py="xs" />
        {view === "cal" ? (
          <CalendarGridView events={events} calendarTime={calendarTime} />
        ) : (
          <CalendarListView events={events} calendarTime={calendarTime} />
        )}
        {view === "list" && (
          <CalendarHeader {...{ calendarTime, setCalendarTime, events }} />
        )}
      </Box>
    </>
  );
}

export const getServerSideProps = getServerSideUser(async ({ locale }) => {
  const characters = await getLocalizedDataArray<GameCharacter>(
    "characters",
    locale,
    "character_id"
  );

  const gameEvents: any = await getLocalizedDataArray(
    "events",
    locale,
    "event_id"
  );

  const scouts = await getLocalizedDataArray<Scout>(
    "scouts",
    locale,
    "gacha_id"
  );

  return {
    props: {
      charactersQuery: characters,
      gameEventsQuery: gameEvents,
      scoutsQuery: scouts,
      locale: locale,
    },
  };
});
Page.getLayout = getLayout({ wide: true });
export default Page;
