type ID = number;
type HexColorWithTag = string;

// CHARACTERS

type CharacterID = ID;
type UnitID = ID;

/** Strings extracted from the game, or translated strings  */
type Text = string;

interface GameCharacterStrings<Type> {
  last_name: Type;
  first_name: Type;
  last_nameRuby?: Type;
  first_nameRuby?: Type;
  character_voice: Type;
  hobby: Type;
  specialty: Type;
  school?: Type;
  class?: Type;
  quote: Type;
  tagline: Type;
  introduction: Type;
}

interface GameCharacter<T = string[]> extends GameCharacterStrings<T> {
  character_id: CharacterID;
  unit: ID[];
  image_color?: HexColorWithTag;
  height: string;
  weight: string; // TBA: Remove units from these fields
  birthday: string; // TBA: Turn into ISO8601-compliant
  age?: number;
  blood_type: "A" | "B" | "O" | "AB";
  circle?: string[];
  sort_id: number;
  horoscope: number;
  renders: {
    fs1_5: number;
    fs1_4: number;
    unit: number;
  };
}

interface GameAgencyString<T> {
  name: T;
  description: T;
}

interface GameAgency<T = string[]> extends GameAgencyString<T> {
  id: ID;
  order: number;
}

interface GameUnitString<T> {
  name: T;
  tagline: T;
  description: T;
}

interface GameUnit<T = string[]> extends GameUnitString<T> {
  id: ID;
  agency: ID;
  image_color?: HexColorWithTag;
  order: number;
}

// CARDS

type CardID = number;
type CardRarity = 1 | 2 | 3 | 4 | 5;
type CardAttribute = 1 | 2 | 3 | 4;
type CardSubStat = 0 | 1 | 2;
type ObtainType = "gacha" | "event" | "special" | "campaign";
type ObtainSubType =
  | "initial"
  | "event"
  | "unit"
  | "feature"
  | "tour"
  | "shuffle"
  | "anniv";

type Stat = number;
interface Stats {
  da: Stat;
  vo: Stat;
  pf: Stat;
}
type StatLevel = "min" | "max" | "ir" | "ir1" | "ir2" | "ir3" | "ir4";

type SkillEffect = any[];
interface SkillStrings<T> {
  name?: T;
  description?: T;
}
interface SkillStringsLive<T> extends SkillStrings<T> {
  live_skill_type_name?: T;
}
interface SkillStringsSupport<T> extends SkillStrings<T> {
  support_skill_type_name?: T;
}
interface SkillData {
  effect_values?: SkillEffect[];
}
type SkillType = "center" | "live" | "support";

interface CenterSkill<T = string[]> extends SkillData, SkillStrings<T> {
  type_id: ID;
}
interface LiveSkill<T = string[]> extends SkillData, SkillStringsLive<T> {
  type_id: ID;
  duration: 5 | 8 | 12;
}

type SupportSkillIDs =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 28;
interface SupportSkill<T = string[]> extends SkillData, SkillStringsSupport<T> {
  type_id: SupportSkillIDs;
}

interface GameCardStrings<T> {
  title: T;
  name?: T;
  obtain?: {
    name?: T;
  };
}

interface GameCardRegional<T> extends GameCardStrings<T> {
  releaseDate: T;
}

interface GameCard<T = string[]> extends GameCardRegional<T> {
  id: CardID;
  rarity: CardRarity;
  character_id: CharacterID;
  type: CardAttribute;
  substat_type: CardSubStat;
  obtain?: {
    type?: ObtainType;
    subType?: ObtainSubType;
    id?: ID;
  };
  stats?: {
    [Level in StatLevel]: Stats;
  };
  skills: {
    center: CenterSkill<T>;
    live: LiveSkill<T>;
    support: SupportSkill<T>;
  };
  spp?: {
    song_id: ID;
    type_id?: ID;
    name?: string;
  };
}

type GameEventTypes = "song" | "tour" | "shuffle";
type ScoutTypes = "scout" | "feature scout";
type EventType =
  | "birthday"
  | "anniversary"
  | "other"
  | ScoutTypes
  | GameEventTypes;
export type GameEventStatus = "start" | "end";

export interface DateRange {
  start_date: string;
  end_date: string;
}

export interface CampaignStrings<T> {
  name: T;
}

export interface CampaignInfo<T = string[]> extends DateRange {
  banner_id: ID[];
  type: EventType;
}

export interface EventStrings<T> extends CampaignStrings<T> {
  intro_lines?: T;
  intro_lines_tl_credit?: T;
  song_name?: T;
}

export interface Event<T = string[]> extends CampaignInfo, EventStrings<T> {
  event_id: ID;
  gacha_id: ID;
  unit_id?: ID[];
  cards: ID[];
  type: GameEventTypes;
}

export interface ScoutStrings<T> extends CampaignStrings<T> {
  intro_lines?: T;
  intro_lines_tl_credit?: T;
}

export interface Scout<T = string[]> extends CampaignInfo, ScoutStrings<T> {
  gacha_id: ID;
  event_id?: ID;
  cards: ID[];
  type: ScoutTypes;
}

export interface Birthday<T = string[]>
  extends CampaignInfo,
    CampaignStrings<T> {
  character_id: ID;
  horoscope: ID;
  type: "birthday";
}

export type Campaign = Event | Scout | Birthday;

export interface RecommendedEvents {
  event: GameCampaign;
  charId: ID;
}
