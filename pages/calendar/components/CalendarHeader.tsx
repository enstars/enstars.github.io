import {
  ActionIcon,
  Box,
  Button,
  createStyles,
  Group,
  MediaQuery,
  Menu,
  NativeSelect,
  Stack,
  Title,
} from "@mantine/core";
import { Calendar } from "@mantine/dates";
import {
  IconArrowLeft,
  IconArrowRight,
  IconSelector,
} from "@tabler/icons-react";
import useTranslation from "next-translate/useTranslation";
import { ReactElement, useCallback, useState } from "react";

import { useDayjs } from "services/libraries/dayjs";
import { Birthday, Event, Scout } from "types/game";

const useStyles = createStyles((theme, _params, getRef) => ({
  header: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  centerSection: {
    textAlign: "center",
    flex: "1 1 0",
  },
}));

function CalendarHeader({
  calendarTime,
  setCalendarTime,
  events,
  children,
}: {
  calendarTime: string;
  setCalendarTime: (a: string) => void;
  events: Array<Event | Scout | Birthday>;
  children?: ReactElement;
}) {
  const { t } = useTranslation("calendar");
  const { classes } = useStyles();
  const { dayjs } = useDayjs();

  const shiftCalendarTime = useCallback(
    (months: number) => {
      setCalendarTime(dayjs(calendarTime).add(months, "month").format());
    },
    [setCalendarTime, calendarTime, dayjs]
  );

  const sortedEvents = events
    .filter((event) => !(event as Birthday).character_id)
    .sort((a, b) => dayjs(a.end.en).diff(dayjs(b.end.en)));

  const earliestEvent = sortedEvents[0];
  const latestEvent = sortedEvents[sortedEvents.length - 1];

  const [openMonths, setOpenMonths] = useState(false);

  return (
    <Box className={classes.header}>
      <Button onClick={() => shiftCalendarTime(-1)} px="xs" variant="subtle">
        <IconArrowLeft size={20} />
        <MediaQuery
          smallerThan="md"
          styles={{
            display: "none",
          }}
        >
          <Box ml={4}>
            {dayjs(calendarTime).add(-1, "month").format("MMM YYYY")}
          </Box>
        </MediaQuery>
      </Button>
      <Stack className={classes.centerSection} spacing={0} align="start">
        <Title order={2} my={0} color="dimmed" size="lg">
          {t("calendarHeader")}
        </Title>
        <Group align="center">
          <Title order={3}>{dayjs(calendarTime).format("MMMM YYYY")}</Title>{" "}
          <Menu shadow="md" opened={openMonths} onChange={setOpenMonths}>
            <Menu.Target>
              <ActionIcon>
                <IconSelector />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Calendar
                firstDayOfWeek="sunday"
                allowLevelChange={false}
                initialLevel="month"
                value={dayjs(calendarTime).startOf("month").toDate()}
                onMonthChange={(date) => {
                  if (date) setCalendarTime(date?.toString());
                  setOpenMonths(false);
                }}
                minDate={dayjs(earliestEvent.start.en)
                  .startOf("month")
                  .toDate()}
                maxDate={dayjs(latestEvent.end.en).endOf("month").toDate()}
              />
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Stack>

      {children}

      <Button onClick={() => shiftCalendarTime(1)} px="xs" variant="subtle">
        <MediaQuery
          smallerThan="md"
          styles={{
            display: "none",
          }}
        >
          <Box mr={4}>
            {dayjs(calendarTime).add(1, "month").format("MMM YYYY")}
          </Box>
        </MediaQuery>
        <IconArrowRight size={20} />
      </Button>
    </Box>
  );
}

export default CalendarHeader;
