import {
  createStyles,
  Group,
  Title,
  Text,
  Paper,
  Box,
  Button,
  Stack,
  useMantineTheme,
  Loader,
} from "@mantine/core";
import { useEffect, useState } from "react";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";
import Trans from "next-translate/Trans";

import Picture from "components/core/Picture";
import { countdown, toCountdownReadable } from "services/campaigns";
import { useDayjs } from "services/libraries/dayjs";
import { Event } from "types/game";

const useStyles = createStyles((theme, _params) => ({
  eventContainer: {
    marginTop: "2vh",
  },

  eventImage: {
    minWidth: "350px",
    maxWidth: "400px",
  },

  link: {
    "&:link": {
      color: theme.primaryColor,
      textDecoration: "none",
    },
    "&:visited": {
      color: theme.primaryColor,
    },
  },
}));

function EventImage({ event }: { event: Event }) {
  if (!event) return <></>;
  return (
    <Link href={`/events/${event.event_id}`}>
      <Picture
        alt={event.name.filter((name) => name !== null)[0]}
        srcB2={`assets/card_still_full1_${event.banner_id}_evolution.webp`}
        sx={{ width: 300, height: 175 }}
        radius="lg"
      />
    </Link>
  );
}

function Countdown({
  date,
  status,
}: {
  date: string;
  status: "start" | "end";
}) {
  const [countdownAmt, setCountdownAmt] = useState<string>();
  useEffect(() => {
    const interval = setInterval(() => {
      let ctdwn = countdown(new Date(date), new Date());
      setCountdownAmt(toCountdownReadable(ctdwn));
    }, 1000);
    return () => clearInterval(interval);
  }, [date]);
  return (
    <Group>
      {countdownAmt ? (
        status === "start" ? (
          <Trans
            i18nKey="home:event.start"
            components={[
              <Text weight={600} key="text" />,
              <Title order={4} key="time" />,
            ]}
            values={{ time: countdownAmt }}
          />
        ) : (
          <Trans
            i18nKey="home:event.end"
            components={[
              <Text weight={600} key="text" />,
              <Title order={4} key="time" />,
            ]}
            values={{ time: countdownAmt }}
          />
        )
      ) : (
        <Box my={3}>
          <Loader variant="dots" />
        </Box>
      )}
    </Group>
  );
}

function CurrentEventCountdown({ shownEvent }: { shownEvent: Event }) {
  const theme = useMantineTheme();
  const { t } = useTranslation("home");
  const { dayjs } = useDayjs();
  const isNextEvent = shownEvent && dayjs().isBefore(shownEvent.start.en);

  const { classes } = useStyles();
  return (
    <Box>
      <Paper
        shadow="xs"
        radius="md"
        p="lg"
        withBorder
        className={classes.eventContainer}
      >
        <Group
          sx={{
            [`@media (max-width: 800px)`]: {
              flexWrap: "wrap",
            },
          }}
          align="flex-start"
          spacing="xl"
        >
          <EventImage event={shownEvent} />
          <Stack justify="space-around">
            {shownEvent && (
              <Box>
                <Title order={3} sx={{ maxWidth: "300px" }}>
                  {shownEvent.name.filter((name) => name !== null)[0]}
                </Title>

                {isNextEvent ? (
                  <Countdown date={shownEvent.start.en} status="start" />
                ) : (
                  <Countdown date={shownEvent.end.en} status="end" />
                )}
              </Box>
            )}
            {shownEvent.type !== "spotlight" && shownEvent.type !== "merge" && (
              <Button
                disabled
                color={theme.primaryColor}
                component="a"
                href="/event-calculator"
              >
                {t("event.eventCalculator")}
              </Button>
            )}
          </Stack>
        </Group>
      </Paper>
    </Box>
  );
}

function CurrentEventCountdowns({ events }: { events: Event[] }) {
  const { dayjs } = useDayjs();

  const theme = useMantineTheme();
  let shownEvents = events.filter((event) => {
    return dayjs().isBefore(event.end.en);
  });
  if (shownEvents.filter((event) => dayjs().isAfter(event.start.en)).length) {
    shownEvents = shownEvents.filter((event) =>
      dayjs().isAfter(event.start.en)
    );
  } else {
    shownEvents = [shownEvents[0]];
  }
  const { t } = useTranslation("home");
  const isNextEvent =
    shownEvents.length &&
    shownEvents.some((shownEvent) => dayjs().isBefore(shownEvent.start.en));

  return (
    <>
      <Group align="end">
        <Title order={2}>
          {isNextEvent ? t("event.next") : t("event.current")}
        </Title>
        <Text
          color={
            theme.colorScheme === "dark"
              ? theme.colors[theme.primaryColor][3]
              : theme.colors[theme.primaryColor][6]
          }
          component={Link}
          href="/events"
        >
          {t("event.seeAll")}
        </Text>
      </Group>
      {shownEvents.map((event) => (
        <CurrentEventCountdown key={event.event_id} shownEvent={event} />
      ))}
    </>
  );
}

export default CurrentEventCountdowns;
