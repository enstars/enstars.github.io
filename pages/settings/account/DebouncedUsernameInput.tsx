import { useState, useMemo, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";
import {
  TextInput,
  Button,
  Loader,
  Text,
  Group,
  useMantineTheme,
} from "@mantine/core";
import { IconCheck, IconX, IconAt } from "@tabler/icons-react";
import Image from "next/image";
import useTranslation from "next-translate/useTranslation";
import axios from "axios";

import kinnie from "./kinnie.png";

import { validateUsernameDb } from "services/firebase/firestore";
import useUser from "services/firebase/user";
import notify from "services/libraries/notify";

// scrolling hell. 305 canon usernames
const canonUsernames = [
  "jin",
  "akiomi",
  "subaru",
  "hokuto",
  "makoto",
  "mao",
  "sora",
  "natsume",
  "tsumugi",
  "madara",
  "hiyori",
  "jun",
  "nagisa",
  "ibara",
  "hiiro",
  "aira",
  "mayoi",
  "tatsumi",
  "kohaku",
  "rinne",
  "himeru",
  "niki",
  "yuzuru",
  "eichi",
  "wataru",
  "tori",
  "adonis",
  "koga",
  "kaoru",
  "rei",
  "tsukasa",
  "ritsu",
  "arashi",
  "izumi",
  "leo",
  "tetora",
  "chiaki",
  "kanata",
  "midori",
  "shinobu",
  "hajime",
  "tomoya",
  "nazuna",
  "mitsuru",
  "hinata",
  "yuta",
  "souma",
  "keito",
  "kuro",
  "mika",
  "shu",
  "sagami",
  "kunugi",
  "akehoshi",
  "hidaka",
  "yuuki",
  "isara",
  "harukawa",
  "sakasaki",
  "aoba",
  "mikejima",
  "tomoe",
  "sazanami",
  "ran",
  "saegusa",
  "amagi",
  "shiratori",
  "ayase",
  "kazehaya",
  "oukawa",
  "amagi",
  "null",
  "shiina",
  "fushimi",
  "tenshouin",
  "hibiki",
  "himemiya",
  "otogari",
  "ogami",
  "hakaze",
  "sakuma",
  "suou",
  "sakuma",
  "narukami",
  "sena",
  "tsukinaga",
  "nagumo",
  "morisawa",
  "shinkai",
  "takamine",
  "sengoku",
  "shino",
  "mashiro",
  "nito",
  "tenma",
  "aoi",
  "aoi",
  "kanzaki",
  "hasumi",
  "kiryu",
  "kagehira",
  "itsuki",
  "jinsagami",
  "akiomikunugi",
  "subaruakehoshi",
  "hokutohidaka",
  "makotoyuuki",
  "maoisara",
  "soraharukawa",
  "natsumesakasaki",
  "tsumugiaoba",
  "madaramikejima",
  "hiyoritomoe",
  "junsazanami",
  "nagisaran",
  "ibarasaegusa",
  "hiiroamagi",
  "airashiratori",
  "mayoiayase",
  "tatsumikazehaya",
  "kohakuoukawa",
  "rinneamagi",
  "himerunull",
  "nikishiina",
  "yuzurufushimi",
  "eichitenshouin",
  "wataruhibiki",
  "torihimemiya",
  "adonisotogari",
  "kogaogami",
  "kaoruhakaze",
  "reisakuma",
  "tsukasasuou",
  "ritsusakuma",
  "arashinarukami",
  "izumisena",
  "leotsukinaga",
  "tetoranagumo",
  "chiakimorisawa",
  "kanatashinkai",
  "midoritakamine",
  "shinobusengoku",
  "hajimeshino",
  "tomoyamashiro",
  "nazunanito",
  "mitsurutenma",
  "hinataaoi",
  "yutaaoi",
  "soumakanzaki",
  "keitohasumi",
  "kurokiryu",
  "mikakagehira",
  "shuitsuki",
  "sagamijin",
  "kunugiakiomi",
  "akehoshisubaru",
  "hidakahokuto",
  "yuukimakoto",
  "isaramao",
  "harukawasora",
  "sakasakinatsume",
  "aobatsumugi",
  "mikejimamadara",
  "tomoehiyori",
  "sazanamijun",
  "rannagisa",
  "saegusaibara",
  "amagihiiro",
  "shiratoriaira",
  "ayasemayoi",
  "kazehayatatsumi",
  "oukawakohaku",
  "amagirinne",
  "nullhimeru",
  "shiinaniki",
  "fushimiyuzuru",
  "tenshouineichi",
  "hibikiwataru",
  "himemiyatori",
  "otogariadonis",
  "ogamikoga",
  "hakazekaoru",
  "sakumarei",
  "suoutsukasa",
  "sakumaritsu",
  "narukamiarashi",
  "senaizumi",
  "tsukinagaleo",
  "nagumotetora",
  "morisawachiaki",
  "shinkaikanata",
  "takaminemidori",
  "sengokushinobu",
  "shinohajime",
  "mashirotomoya",
  "nitonazuna",
  "tenmamitsuru",
  "aoihinata",
  "aoiyuta",
  "kanzakisouma",
  "hasumikeito",
  "kiryukuro",
  "kagehiramika",
  "itsukishu",
  "jin_sagami",
  "akiomi_kunugi",
  "subaru_akehoshi",
  "hokuto_hidaka",
  "makoto_yuuki",
  "mao_isara",
  "sora_harukawa",
  "natsume_sakasaki",
  "tsumugi_aoba",
  "madara_mikejima",
  "hiyori_tomoe",
  "jun_sazanami",
  "nagisa_ran",
  "ibara_saegusa",
  "hiiro_amagi",
  "aira_shiratori",
  "mayoi_ayase",
  "tatsumi_kazehaya",
  "kohaku_oukawa",
  "rinne_amagi",
  "himeru_null",
  "niki_shiina",
  "yuzuru_fushimi",
  "eichi_tenshouin",
  "wataru_hibiki",
  "tori_himemiya",
  "adonis_otogari",
  "koga_ogami",
  "kaoru_hakaze",
  "rei_sakuma",
  "tsukasa_suou",
  "ritsu_sakuma",
  "arashi_narukami",
  "izumi_sena",
  "leo_tsukinaga",
  "tetora_nagumo",
  "chiaki_morisawa",
  "kanata_shinkai",
  "midori_takamine",
  "shinobu_sengoku",
  "hajime_shino",
  "tomoya_mashiro",
  "nazuna_nito",
  "mitsuru_tenma",
  "hinata_aoi",
  "yuta_aoi",
  "souma_kanzaki",
  "keito_hasumi",
  "kuro_kiryu",
  "mika_kagehira",
  "shu_itsuki",
  "sagami_jin",
  "kunugi_akiomi",
  "akehoshi_subaru",
  "hidaka_hokuto",
  "yuuki_makoto",
  "isara_mao",
  "harukawa_sora",
  "sakasaki_natsume",
  "aoba_tsumugi",
  "mikejima_madara",
  "tomoe_hiyori",
  "sazanami_jun",
  "ran_nagisa",
  "saegusa_ibara",
  "amagi_hiiro",
  "shiratori_aira",
  "ayase_mayoi",
  "kazehaya_tatsumi",
  "oukawa_kohaku",
  "amagi_rinne",
  "null_himeru",
  "shiina_niki",
  "fushimi_yuzuru",
  "tenshouin_eichi",
  "hibiki_wataru",
  "himemiya_tori",
  "otogari_adonis",
  "ogami_koga",
  "hakaze_kaoru",
  "sakuma_rei",
  "suou_tsukasa",
  "sakuma_ritsu",
  "narukami_arashi",
  "sena_izumi",
  "tsukinaga_leo",
  "nagumo_tetora",
  "morisawa_chiaki",
  "shinkai_kanata",
  "takamine_midori",
  "sengoku_shinobu",
  "shino_hajime",
  "mashiro_tomoya",
  "nito_nazuna",
  "tenma_mitsuru",
  "aoi_hinata",
  "aoi_yuta",
  "kanzaki_souma",
  "hasumi_keito",
  "kiryu_kuro",
  "kagehira_mika",
  "itsuki_shu",
];

function DebouncedUsernameInput({ changedCallback = () => {} }) {
  const { t } = useTranslation("settings");
  const theme = useMantineTheme();
  const { userDB, updateUserDB } = useUser();
  const [inputValue, setInputValue] = useState(userDB?.username ?? "");

  const [newUsername, setNewUsername] = useState(userDB?.username ?? "");
  const [usernameMsg, setUsernameMsg] = useState("");
  const [usernameJudgement, setUsernameJudgement] = useState(true);

  const handleValueChange = useDebouncedCallback((value) => {
    validateUsername(value);
  }, 1000);

  const memoizedHandleValueChange = useMemo(
    () => handleValueChange,
    [handleValueChange]
  );

  useEffect(() => {
    if (userDB) setInputValue(userDB.username);
  }, [userDB]);

  const validateUsername = async (value: string) => {
    if (userDB) {
      setUsernameJudgement(false);
      setNewUsername("");

      // TODO : move this validation server side
      if (value === userDB?.username) {
        setUsernameMsg("");
        setUsernameJudgement(true);
      } else if (value.replace(/[a-z0-9_]/g, "").length > 0) {
        setUsernameMsg(t("account.usernameErrorAlphanumeric"));
        setUsernameJudgement(true);
      } else if (value.startsWith("_") || value.endsWith("_")) {
        setUsernameMsg(t("account.usernameErrorUnderscore"));
        setUsernameJudgement(true);
      } else if (value.length === 0) {
        setUsernameMsg(t("account.usernameErrorEmpty"));
        setUsernameJudgement(true);
      } else if (value.length < 8) {
        setUsernameMsg(t("account.usernameErrorShort"));
        setUsernameJudgement(true);
      } else if (value.length > 15) {
        setUsernameMsg(t("account.usernameErrorLong"));
        setUsernameJudgement(true);
      } else {
        try {
          const res = await axios.post("/api/username/validate", {
            username: value,
          });
          const usernameValid = res.data.valid;
          if (!usernameValid) {
            setUsernameMsg(t("account.usernameTaken"));
            setUsernameJudgement(true);
          } else {
            setNewUsername(value);
            setUsernameMsg(t("account.usernameAvailable"));
            setUsernameJudgement(true);
          }
        } catch {
          setUsernameMsg(t("account.usernameTaken"));
          setUsernameJudgement(true);
        }
      }
    }
  };

  const validateAndSaveUsername = async () => {
    if (userDB) {
      const usernameValid = await validateUsernameDb(newUsername);
      if (usernameValid) {
        updateUserDB?.mutate({ username: newUsername });
        setNewUsername("");
        changedCallback();
        if (newUsername && canonUsernames.includes(newUsername)) {
          notify("info", {
            title: t("account.unEasterEgg"),
            message: (
              <>
                <Image
                  src={kinnie}
                  alt={t("account.iLaughedIrl")}
                  width={200}
                  height={200}
                />
              </>
            ),
            autoClose: false,
            sx: { maxHeight: 999 },
          });
        }
      }
    }
  };

  return (
    <>
      <Group spacing="xs" sx={{ flexWrap: "nowrap" }}>
        <TextInput
          value={inputValue}
          icon={<IconAt size="16" />}
          onChange={(e) => {
            setUsernameJudgement(false);
            setInputValue(e.target.value);
            memoizedHandleValueChange(e.target.value);
          }}
          {...(userDB && inputValue === userDB?.username
            ? null
            : !usernameJudgement
            ? { rightSection: <Loader size="xs" /> }
            : newUsername
            ? {
                rightSection: (
                  <IconCheck size={18} color={theme.colors.green[5]} />
                ),
              }
            : {
                rightSection: <IconX size={18} color={theme.colors.red[5]} />,
                error: true,
              })}
          sx={{ flexGrow: 1 }}
        />
        <Button
          onClick={validateAndSaveUsername}
          {...(userDB &&
          inputValue !== userDB?.username &&
          (usernameJudgement || newUsername)
            ? null
            : { disabled: true })}
        >
          {t("save")}
        </Button>
      </Group>
      <Text mt="xs" color="dimmed" size="xs">
        {userDB && inputValue !== userDB?.username && usernameJudgement
          ? usernameMsg
          : t("account.newUsername")}
      </Text>
    </>
  );
}

export default DebouncedUsernameInput;
