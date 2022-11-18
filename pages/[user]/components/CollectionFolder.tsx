import {
  Accordion,
  ActionIcon,
  Box,
  Button,
  Group,
  Indicator,
  Menu,
  Modal,
  Paper,
  Select,
  Space,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import {
  IconArrowsSort,
  IconCheck,
  IconCircle,
  IconDots,
  IconEye,
  IconPencil,
  IconSortAscending,
  IconSortDescending,
  IconTrash,
  IconX,
} from "@tabler/icons";
import { useEffect, useState } from "react";

import CollectionCard from "./CollectionCard";

import { CardCollection, CollectedCard } from "types/makotools";

function CollectionFolder({
  collection,
  editing,
  deleteFunction,
}: {
  collection: CardCollection;
  editing: boolean;
  deleteFunction: (collection: CardCollection) => void;
}) {
  const [focused, setFocused] = useState<string>("");
  const [color, setColor] = useState<string>(collection.color || "#D3D6E0");
  const [privacyLevel, setPrivacy] = useState<number>(
    collection.privacyLevel || 0
  );
  const [isDefault, setAsDefault] = useState<boolean>(true);
  const [asc, setAsc] = useState<boolean>(true);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);

  const theme = useMantineTheme();

  const COLORS: string[] = [
    "#d3d6e0",
    "#ff8787",
    "#faa2c1",
    "#b197fc",
    "#4dabf7",
    "#38d9a9",
    "#a9e34b",
    "#ffd43b",
  ];

  useEffect(() => {
    setFocused("");
  }, [editing]);

  return editing ? (
    <>
      <Modal
        opened={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        title={<Title order={3}>Delete {collection.name}?</Title>}
        withCloseButton={false}
        centered
        size="lg"
      >
        <Text size="lg">
          Are you sure you want to delete {collection.name}?
        </Text>
        <Space h="lg" />
        <Group position="right">
          <Button variant="outline" onClick={() => setOpenDeleteModal(false)}>
            No, go back
          </Button>
          <Button
            leftIcon={<IconTrash />}
            color="red"
            onClick={() => {
              setOpenDeleteModal(false);
              deleteFunction(collection);
            }}
          >
            Yes, Delete
          </Button>
        </Group>
      </Modal>
      <Paper withBorder p="md">
        <Group noWrap>
          <Menu position="top">
            <Menu.Target>
              <Indicator
                color="indigo"
                size={15}
                offset={5}
                label={<IconPencil size={10} />}
              >
                <ActionIcon>
                  <IconCircle fill={color} size={20} />
                </ActionIcon>
              </Indicator>
            </Menu.Target>
            <Menu.Dropdown sx={{ width: "auto", maxWidth: "190px" }}>
              <Menu.Label>Choose Collection Color</Menu.Label>
              {COLORS.map((color) => (
                <Menu.Item
                  key={color}
                  component="button"
                  onClick={() => setColor(color)}
                  sx={{ width: "auto", display: "inline" }}
                >
                  <IconCircle size={20} fill={color} stroke={0} />
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
          <TextInput
            id="field-0"
            aria-label="Input collection name"
            placeholder="Input collection name"
            onFocus={(event) => setFocused(event.target.id)}
            onBlur={(event) => setFocused("")}
          />
          <Menu position="top">
            <Menu.Target>
              <ActionIcon>
                <IconDots />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Collection options</Menu.Label>
              <Menu.Item icon={<IconCheck />} disabled={isDefault}>
                Set collection as default
              </Menu.Item>
              <Menu.Item
                icon={<IconEye />}
                component="div"
                sx={{ alignItems: "flex-start" }}
                closeMenuOnClick={false}
              >
                <Stack>
                  <Text>Set Privacy Level</Text>
                  <Select
                    data={[
                      { value: "0", label: "Public to everyone" },
                      { value: "1", label: "Visible to logged in users" },
                      { value: "2", label: "Visible only to followers" },
                      { value: "3", label: "Completely private" },
                    ]}
                    defaultValue={`${privacyLevel}`}
                    onChange={(value) => setPrivacy(parseInt(value as string))}
                  />
                </Stack>
              </Menu.Item>
              <Menu.Item
                icon={<IconX />}
                sx={{ color: theme.colors.red[4] }}
                onClick={() => setOpenDeleteModal(true)}
              >
                Delete collection
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
        <Space h="lg" />
        <Accordion defaultValue="cards">
          <Accordion.Item value="cards">
            <Accordion.Control>View cards</Accordion.Control>
            <Accordion.Panel>
              <Select
                placeholder="Sort by..."
                data={[
                  { value: "dateAdded", label: "Date added" },
                  { value: "charId", label: "Character ID" },
                  { value: "cardId", label: "Card ID" },
                ]}
                icon={<IconArrowsSort size="1em" />}
                rightSection={
                  <Tooltip label="Toggle ascending/descending">
                    <ActionIcon variant="light" color="blue">
                      {asc ? (
                        <IconSortAscending size={16} />
                      ) : (
                        <IconSortDescending size={16} />
                      )}
                    </ActionIcon>
                  </Tooltip>
                }
              />
              <Space h="lg" />
              <Box
                sx={(theme) => ({
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                  gap: theme.spacing.xs,
                })}
              >
                {collection.cards
                  ?.filter((c: CollectedCard) => c.count)
                  .sort(
                    (a: CollectedCard, b: CollectedCard) => b.count - a.count
                  )
                  .map((c: CollectedCard) => (
                    <CollectionCard key={c.id} card={c} editing={editing} />
                  ))}
              </Box>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Paper>
    </>
  ) : (
    <Accordion variant="contained" defaultValue="default">
      <Accordion.Item value="default">
        <Accordion.Control>
          <Group noWrap>
            <IconCircle fill={color} size={20} stroke={0} />
            <Title order={4}>{collection.name}</Title>
          </Group>
        </Accordion.Control>
        <Accordion.Panel>
          <Box
            sx={(theme) => ({
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
              gap: theme.spacing.xs,
            })}
          >
            {collection.cards
              ?.filter((c: CollectedCard) => c.count)
              .sort((a: CollectedCard, b: CollectedCard) => b.count - a.count)
              .map((c: CollectedCard) => (
                <CollectionCard key={c.id} card={c} editing={editing} />
              ))}
          </Box>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}

export default CollectionFolder;
