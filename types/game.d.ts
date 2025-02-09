/** Numerical ID */
type ID = number;
type HexColorWithTag = string;

// GENERIC TYPES

type GameRegion = "jp" | "en" | "cn" | "kr" | "tw";
interface ForEachRegion<T> {
  jp: T;
  en: T;
  cn?: T;
  kr?: T;
  tw?: T;
}

// CHARACTERS

interface VersionedCharacterData<T> {
    date: string;
    reason: string;
    value: T;
}

interface GameCharacterStrings<Type> {
  last_name: Type;
  first_name: Type;

  /** Reading guide for last name, eg. furigana */
  last_nameRuby?: Type;

  /** Reading guide for first name, eg. furigana */
  first_nameRuby?: Type;

  /** Character voice actor */
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
  character_id: ID;
  unit: ID[];
  image_color?: HexColorWithTag;

  /** Height in cms */
  height: number;
  heights: Array<VersionedCharacterData<number>>;

  /** Weight in kgs */
  weight: number;
  weights: Array<VersionedCharacterData<number>>;

  /** Birthday in YYYY-MM-DD format */
  birthday: string;
  age?: number;
  ages?: Array<VersionedCharacterData<number>>;
  blood_type: "A" | "B" | "O" | "AB";
  circle?: string[];
  sort_id: number;

  /** Versioned strings */
    hobbies: Array<VersionedCharacterData<T>>;
    specialties: Array<VersionedCharacterData<T>>;
    quotes: Array<VersionedCharacterData<T>>;
    taglines: Array<VersionedCharacterData<T>>;
    introductions: Array<VersionedCharacterData<T>>;

  /** Horoscope
   *
   * 0 = aries (March 21 – April 19) (WHY are there only 2 aries in enstars :airacringe:
   *
   * 1 = taurus (April 20 – May 20)
   *
   * 2 = gemini (May 21 – June 20)
   *
   * 3 = cancer (June 21 – July 22)
   *
   * 4 = leo (July 23 – August 22)
   *
   * 5 = virgo (August 23 – September 22)
   *
   * 6 = libra (September 23 – October 22)
   *
   * 7 = scorpio (October 23 – November 21)
   *
   * 8 = sagittarius (November 22 – December 21)
   *
   * 9 = capricorn (December 22 – January 19)
   *
   * 10 = aquarius (January 20 – February 18)
   *
   * 11 = pisces (February 19 – March 20)
   */
  horoscope: number;

  /** Main character renders, sorted by type */
  renders: {
    full: Array<VersionedCharacterData<string>>;
    /** 1st Feature Scout 5* */
    fs1_5: number;
    /** 1st Feature Scout 4* */
    fs1_4: number;
    /** Unit render */
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

type CardRarity = 1 | 2 | 3 | 4 | 5;
/** 1 = Sparkle
 *
 * 2 = Brilliant
 *
 * 3 = Glitter
 *
 * 4 = Flash
 */
type CardAttribute = 1 | 2 | 3 | 4;
/** 0 = Da
 *
 * 1 = Vo
 *
 * 2 = Pf
 */
type CardSubStat = 0 | 1 | 2;

/** Methods of obtaining a card
 *
 * gacha: scout banners (initial, event, feature, anniv)
 *
 * event: event rewards (unit, tour, shuffle)
 *
 * special: all the other weirdnesses
 *
 * initial: 1-2* cards given to new players
 */
type ObtainType = "gacha" | "event" | "special" | "initial";
type ObtainSubType =
  | "initial"
  | "event"
  | "feature"
  | "anniv"
  | "unit"
  | "tour"
  | "shuffle";

/** A card's stat value */
type Stat = number;
interface Stats {
  da: Stat;
  vo: Stat;
  pf: Stat;
}

/** Levels of card stats
 *
 * min: minimum stat value
 *
 * max: maximum stat value without Idol Road (to be deprecated)
 *
 * ir: maximum stat value with Idol Road
 *
 * ir1: maximum stat value with Idol Road, 1 limit break (2 copies)
 *
 * ir2: maximum stat value with Idol Road, 2 limit breaks (3 copies)
 *
 * ir3: maximum stat value with Idol Road, 3 limit breaks (4 copies)
 *
 * ir4: maximum stat value with Idol Road, 4 limit breaks (5 copies)
 */
type StatLevel = "min" | "max" | "ir" | "ir1" | "ir2" | "ir3" | "ir4";

type SkillEffect = any[];
interface SkillStrings<T> {
  name?: T;
}

type CenterSkillIDs =
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
  | 17;

interface CenterSkill<T = string[]> extends SkillStrings<T> {
  type_id?: CenterSkillIDs;
  effect_value: (number | string)[];
}

type LiveSkillIDs = 1 | 2;
interface LiveSkill<T = string[]> extends SkillStrings<T> {
  type_id?: LiveSkillIDs;
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
  | 28
  | 29
  | 30;

interface SupportSkill<T = string[]> extends SkillStrings<T> {
  type_id?: SupportSkillIDs;
}

interface GameCardStrings<T> {
  /** Card's title */
  title: T;

  /** Card character's name  */
  name: T;
}

interface Obtain {
  type: ObtainType;
  subType?: ObtainSubType;
  id?: ID;
}

interface GameCard<T = string[]> extends GameCardStrings<T> {
  id: ID;
  rarity: CardRarity;
  character_id: ID;

  /** 1 = sparkle
   *
   * 2 = brilliant
   *
   * 3 = glitter
   *
   * 4 = flash
   */
  type: CardAttribute;

  /** 0 = da
   *
   * 1 = vo
   *
   * 2 = pf
   */
  substat_type: CardSubStat;
  releaseDate: ForEachRegion<string>;
  obtain: Obtain;
  stats: {
    [Level in StatLevel]?: Stats;
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

interface GameCardOld {
  id: ID;
  character_id: ID;
  rarity: CardRarity;
  name: {
    jp: string;
    en: string;
  };
}

export type EventType = "song" | "tour" | "shuffle" | "special";
export type ScoutType = "scout" | "feature scout";
type CampaignType =
  | "birthday"
  | "anniversary"
  | "other"
  | ScoutTypes
  | GameEventTypes;
export type GameEventStatus = "start" | "end";

export interface RegionalTimeRange {
  start: ForEachRegion<string>;
  end: ForEachRegion<string>;
}

export interface CampaignStrings<T> {
  /** Localized event name */
  name: T;
}

export interface CampaignInfo<T = string[]> extends RegionalTimeRange {
  /** Card ID for the event's main card */
  banner_id: ID;

  /** Type of campaign.
   *
   * Events: "song", "tour", "shuffle"
   *
   * Scouts: "scout", "feature scout"
   *
   * Others: "birthday", "anniversary", "other"
   *
   * @see CampaignType
   */
  type: CampaignType;
}

export interface EventStrings<T> extends CampaignStrings<T> {
  /** Blurb for event */
  intro_lines?: T;
  intro_lines_tl_credit?: T;

  /** Event's song name, if exists */
  song_name?: T;

  /** Event story name, can be used as a short way to refer to the scout */
  story_name: T;
}

export interface Event<T = string[]> extends CampaignInfo, EventStrings<T> {
  event_id: ID;
  gacha_id: ID | ID[];
  unit_id?: ID[];
  cards: ID[];
  type: EventType;
}

export interface ScoutStrings<T> extends CampaignStrings<T> {
  /** Blurb for scout */
  intro_lines?: T;
  intro_lines_tl_credit?: T;

  /** Scout story name, can be used as a short way to refer to the scout */
  story_name: T;
}

export interface Scout<T = string[]> extends CampaignInfo, ScoutStrings<T> {
  /** Unique ID for the scout banner */
  gacha_id: ID;

  /** Related event ID, if one exists */
  event_id?: ID;

  /** List of the scout's card IDs */
  cards: ID[];

  type: ScoutType;
  /** Related cross scout if scout is a cross scout */
  related_id?: ID;
}

export interface BirthdayStrings<T> extends CampaignStrings<T> {}

export interface Birthday<T = string[]>
  extends CampaignInfo,
    BirthdayStrings<T> {
  character_id: ID;
  horoscope: ID;
  type: "birthday";
  shortCharacterName: T;
}

export type Campaign = Event | Scout | Birthday;

export interface RecommendedEvents {
  event: GameCampaign;
  charId: ID;
}
