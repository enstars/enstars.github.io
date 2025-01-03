import {
  ActionIcon,
  CopyButton,
  Group,
  Indicator,
  Menu,
  Tooltip,
  Text,
  useMantineTheme,
} from "@mantine/core";
import {
  IconPencil,
  IconCopy,
  IconLink,
  IconCheck,
  IconX,
  IconUserPlus,
  IconUserX,
  IconUserExclamation,
  IconArrowsUpDown,
  IconFlag,
} from "@tabler/icons-react";
import Link from "next/link";
import { Dispatch, SetStateAction } from "react";
import useTranslation from "next-translate/useTranslation";

import { CONSTANTS } from "services/makotools/constants";
import notify from "services/libraries/notify";
import { UserData } from "types/makotools";
import { UseMutateFunction } from "@tanstack/react-query";
import { AuthUser } from "next-firebase-auth";

/**
 * Friend, edit profile, and sharable link buttons
 */
function ProfileButtons({
  user,
  profile,
  isOwnProfile,
  isFriend,
  isIncomingReq,
  isOutgoingReq,
  setRemoveFriendModal,
  addFriendFunction,
  sendFriendReq,
  deleteFriendReq,
  cancelFriendReq,
  openEditModal,
}: {
  user: AuthUser | undefined | null;
  profile: UserData;
  isOwnProfile: boolean;
  isFriend: boolean;
  isIncomingReq: boolean;
  isOutgoingReq: boolean;
  setRemoveFriendModal: Dispatch<SetStateAction<boolean>>;
  addFriendFunction: UseMutateFunction<void, Error, void, void>;
  sendFriendReq: UseMutateFunction<void, Error, void, void>;
  deleteFriendReq: UseMutateFunction<void, Error, void, void>;
  cancelFriendReq: UseMutateFunction<void, Error, void, void>;
  openEditModal: () => void;
}) {
  const { t } = useTranslation("user");
  const theme = useMantineTheme();

  const shareURL = `enstars.link/@${profile.username}`;
  const shareURLFull = `https://enstars.link/@${profile.username}`;
  return (
    <Group spacing="xs">
      {isOwnProfile && (
        <Tooltip label={t("editProfile")}>
          <ActionIcon
            onClick={openEditModal}
            size="lg"
            color="green"
            variant="light"
          >
            <IconPencil size={18} />
          </ActionIcon>
        </Tooltip>
      )}
      <CopyButton value={shareURLFull}>
        {({ copy }) => (
          <Tooltip label={t("copyUrl")}>
            <ActionIcon
              onClick={() => {
                copy();
                notify("info", {
                  icon: <IconCopy size={16} />,
                  message: t("linkCopied"),
                  title: (
                    <>
                      <Text span>
                        <Text span weight={400}>
                          https://
                        </Text>
                        <Text span weight={700}>
                          {shareURL}
                        </Text>
                      </Text>
                    </>
                  ),
                });
              }}
              size="lg"
              color={theme.primaryColor}
              variant="light"
            >
              <IconLink size={18} />
            </ActionIcon>
          </Tooltip>
        )}
      </CopyButton>
      {!isOwnProfile && (
        <>
          {user && !isFriend && !isOutgoingReq && !isIncomingReq && (
            <Tooltip label={t("sendFriendReq")}>
              <ActionIcon
                onClick={() => sendFriendReq()}
                size="lg"
                color="green"
                variant="light"
              >
                <IconUserPlus size={18} />
              </ActionIcon>
            </Tooltip>
          )}
          {isFriend && (
            <Tooltip label={t("removeFriend")}>
              <ActionIcon
                size="lg"
                color="red"
                variant="light"
                onClick={() => setRemoveFriendModal(true)}
              >
                <IconUserX size={18} />
              </ActionIcon>
            </Tooltip>
          )}
          {!isFriend && isIncomingReq && (
            <Menu width={200} position="top">
              <Menu.Target>
                <Tooltip label={t("sentFriendReq", { friend: profile.name })}>
                  <Indicator>
                    <ActionIcon size="lg" variant="light">
                      <IconUserExclamation size={18} />
                    </ActionIcon>
                  </Indicator>
                </Tooltip>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>{t("friendReqOptions")}</Menu.Label>
                <Menu.Item
                  icon={<IconCheck size={14} />}
                  px={5}
                  onClick={() => addFriendFunction()}
                >
                  {t("acceptFriendReq")}
                </Menu.Item>
                <Menu.Item
                  color="red"
                  icon={<IconX size={14} />}
                  px={5}
                  onClick={() => deleteFriendReq()}
                >
                  <Text size="sm">{t("declineFriendReq")}</Text>
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
          {!isFriend && isOutgoingReq && (
            <Menu width={200} position="top">
              <Menu.Target>
                <Tooltip label={t("pendingFriendReq")}>
                  <ActionIcon size="lg" variant="light">
                    <IconArrowsUpDown size={18} />
                  </ActionIcon>
                </Tooltip>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  color="red"
                  icon={<IconX size={14} />}
                  py={2}
                  px={5}
                  onClick={() => cancelFriendReq()}
                >
                  <Text size="sm">Cancel friend request</Text>
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
          <Tooltip label={t("reportProfile")}>
            <ActionIcon
              component={Link}
              href={CONSTANTS.MODERATION.GET_REPORT_LINK(
                profile.username,
                profile.suid
              )}
              target="_blank"
              size="lg"
              color="orange"
              variant="light"
            >
              <IconFlag size={18} />
            </ActionIcon>
          </Tooltip>
        </>
      )}
    </Group>
  );
}

export default ProfileButtons;
