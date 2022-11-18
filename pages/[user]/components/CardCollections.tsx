import { Box, Button, Group, Stack, Text, Title } from "@mantine/core";
import { IconDeviceFloppy, IconPencil, IconPlus } from "@tabler/icons";
import { useState } from "react";

import CollectionFolder from "./CollectionFolder";

import { CardCollection, User, UserData } from "types/makotools";

function CardCollections({ user, profile }: { user: User; profile: UserData }) {
  const [editMode, setEditMode] = useState<boolean>(false);
  const [collections, changeCollections] = useState<CardCollection[]>([
    {
      name: "Collection #1",
      privacyLevel: 0,
      default: true,
      cards: profile.collection || [],
    },
  ]);
  const isYourProfile = user.loggedIn && user.db.suid === profile.suid;

  function removeCollection(collection: CardCollection) {
    changeCollections(
      collections.splice(collections.indexOf(collection) - 1, 1)
    );
  }

  return (
    <Box>
      <Group>
        <Title order={2} mt="md" mb="xs">
          Collections
        </Title>
        {isYourProfile && (
          <Button
            color="indigo"
            radius="xl"
            variant="subtle"
            leftIcon={editMode ? <IconDeviceFloppy /> : <IconPencil />}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? "Save" : "Edit"}
          </Button>
        )}
      </Group>
      {!profile?.collection?.length ? (
        <Text color="dimmed" size="sm">
          This user has no card collections.
          {isYourProfile && (
            <Button color="indigo" variant="outline" leftIcon={<IconPlus />}>
              Create a collection
            </Button>
          )}
        </Text>
      ) : (
        <Stack align="stretch">
          {editMode && (
            <Button
              color="indigo"
              variant="outline"
              leftIcon={<IconPlus />}
              onClick={() => {
                changeCollections([
                  {
                    name: `Collection #${collections.length + 1}`,
                    privacyLevel: 0,
                    default: false,
                    cards: [],
                  },
                  ...collections,
                ]);
              }}
            >
              Add collection
            </Button>
          )}
          {collections.map((collection, index) => (
            <CollectionFolder
              key={index}
              collection={collection}
              editing={editMode}
              deleteFunction={removeCollection}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default CardCollections;
