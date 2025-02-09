import { Box, useMantineTheme } from "@mantine/core";
import { Parallax, useParallaxController } from "react-scroll-parallax";

import { GameCharacter } from "types/game";
import Picture from "components/core/Picture";
import { Dayjs } from "dayjs";

export function CharaRender(
  // theme,
  // renderFaded: boolean,
  // character: GameCharacter<string[]>,
  // renderHeight: number
  {
    theme,
    renderFaded,
    character,
    renderHeight,
    selectedVersion,
  }: {
    theme: ReturnType<typeof useMantineTheme>;
    renderFaded: boolean;
    character: GameCharacter<string[]>;
    renderHeight: number;
    selectedVersion: { date: Dayjs; reason: string; id: number };
  }
) {
  const parallaxController = useParallaxController();
  console.log(character);
  return (
    <Box
      id="chara-render"
      sx={{
        width: 700,
        zIndex: 3,
        pointerEvents: "none",
        left: "50%",
        top: scrollY / 5,
        position: "absolute",
        transition: "0.2s ease",

        [`@media (max-width: ${theme.breakpoints.md}px)`]: {
          marginLeft: 0,
          left: "87.5%",
          width: 500,
          top: theme.spacing.xl,
        },

        transform: renderFaded
          ? "translateX(-50%) translateX(33%)"
          : "translateX(-50%)",
        opacity: renderFaded ? 0.25 : 1,
      }}
    >
      <Box
        sx={{
          width: "100%",
          // marginLeft: "10%",
          // marginTop: "50px",
          [`@media (max-width: ${theme.breakpoints.md}px)`]: {
            width: 500,
            margin: 0,
          },
        }}
      >
        <Parallax speed={-10}>
          <Picture
            loading="eager"
            srcB2={`render/character_full1_${character.character_id}.png`}
            transparent
            alt={character.first_name[0] || "Character render"}
            fill={false}
            width={renderHeight}
            height={renderHeight}
            style={{
              userSelect: "none",
              pointerEvents: "none",
            }}
            onLoad={() => {
              if (parallaxController) parallaxController.update();
            }}
          />
        </Parallax>
      </Box>
    </Box>
  );
}
