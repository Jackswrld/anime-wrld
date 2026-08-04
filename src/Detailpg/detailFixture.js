const detailFixture = {
  id: 20613,
  title: {
    romaji: "Ao Haru Ride",
    english: "Blue Spring Ride",
    native: "アオハライド",
  },
  description:
    "Futaba Yoshioka wants to make a fresh start in high school.<br><br>But when she runs into <i>Kou Mabuchi</i>, a boy she once loved in middle school, old feelings resurface.<br><br>Together they navigate friendship, heartbreak, and growing up.",
  bannerImage: "https://placehold.co/1200x400",
  coverImage: {
    extraLarge: "https://placehold.co/460x650",
    large: "https://placehold.co/460x650",
    color: "#e4a15b",
  },
  format: "TV",
  episodes: 12,
  duration: 24,
  status: "FINISHED",
  season: "SUMMER",
  seasonYear: 2014,
  averageScore: 75,
  popularity: 231842,
  source: "MANGA",
  genres: ["Comedy", "Drama", "Romance", "Shoujo"],
  studios: {
    edges: [
      { isMain: true, node: { id: 11, name: "Production I.G" } },
      { isMain: false, node: { id: 22, name: "Other Studio" } },
    ],
  },
  rankings: [
    {
      id: 1,
      rank: 82,
      type: "RATED",
      format: "TV",
      year: 2014,
      season: "SUMMER",
      allTime: false,
      context: "highest rated summer 2014 anime",
    },
    {
      id: 2,
      rank: 45,
      type: "POPULAR",
      format: "TV",
      year: null,
      season: null,
      allTime: true,
      context: "most popular all time",
    },
    {
      id: 3,
      rank: 120,
      type: "RATED",
      format: "TV",
      year: null,
      season: null,
      allTime: true,
      context: "highest rated all time",
    },
  ],
  tags: [
    { id: 1, name: "Tragedy", rank: 70, isMediaSpoiler: false, isGeneralSpoiler: false, isAdult: false },
    { id: 2, name: "School", rank: 85, isMediaSpoiler: false, isGeneralSpoiler: false, isAdult: false },
    { id: 3, name: "Coming of Age", rank: 80, isMediaSpoiler: false, isGeneralSpoiler: false, isAdult: false },
    { id: 4, name: "Female Protagonist", rank: 90, isMediaSpoiler: false, isGeneralSpoiler: false, isAdult: false },
    { id: 5, name: "Primarily Female Cast", rank: 60, isMediaSpoiler: false, isGeneralSpoiler: false, isAdult: false },
    { id: 6, name: "Love Triangle", rank: 75, isMediaSpoiler: false, isGeneralSpoiler: false, isAdult: false },
    { id: 7, name: "Time Skip", rank: 55, isMediaSpoiler: true, isGeneralSpoiler: false, isAdult: false },
    { id: 8, name: "Character Death", rank: 50, isMediaSpoiler: true, isGeneralSpoiler: true, isAdult: false },
    { id: 9, name: "Tsundere", rank: 65, isMediaSpoiler: false, isGeneralSpoiler: false, isAdult: false },
    { id: 10, name: "Ensemble Cast", rank: 45, isMediaSpoiler: false, isGeneralSpoiler: false, isAdult: false },
    { id: 11, name: "Nudity", rank: 40, isMediaSpoiler: false, isGeneralSpoiler: false, isAdult: true },
    { id: 12, name: "Friendship", rank: 72, isMediaSpoiler: false, isGeneralSpoiler: false, isAdult: false },
  ],
  relations: {
    edges: [
      {
        id: 1,
        relationType: "SEQUEL",
        node: {
          id: 30001,
          type: "ANIME",
          format: "TV",
          status: "RELEASING",
          title: {
            romaji: "Ao Haru Ride 2",
            english: "Blue Spring Ride 2",
            native: "アオハライド2",
          },
          coverImage: { large: "https://placehold.co/100x140", color: "#4a6fa5" },
          isAdult: false,
        },
      },
      {
        id: 2,
        relationType: "PREQUEL",
        node: {
          id: 30002,
          type: "ANIME",
          format: "ONA",
          status: "FINISHED",
          title: {
            romaji: "Ao Haru Ride: Prologue",
            english: null,
            native: "アオハライド:プロローグ",
          },
          coverImage: { large: "https://placehold.co/100x140", color: "#5a7fb5" },
          isAdult: false,
        },
      },
      {
        id: 3,
        relationType: "ADAPTATION",
        node: {
          id: 30003,
          type: "MANGA",
          format: "MANGA",
          status: "FINISHED",
          title: {
            romaji: "Ao Haru Ride",
            english: "Blue Spring Ride",
            native: "アオハライド",
          },
          coverImage: { large: "https://placehold.co/100x140", color: "#6a8fc5" },
          isAdult: false,
        },
      },
      {
        id: 4,
        relationType: "SIDE_STORY",
        node: {
          id: 30004,
          type: "MANGA",
          format: "ONE_SHOT",
          status: "FINISHED",
          title: {
            romaji: "Ao Haru Ride: Side Story",
            english: "Blue Spring Ride: Side Story",
            native: null,
          },
          coverImage: { large: null, color: "#7a9fd5" },
          isAdult: false,
        },
      },
      {
        id: 5,
        relationType: "ALTERNATIVE",
        node: {
          id: 30005,
          type: "ANIME",
          format: "MOVIE",
          status: "NOT_YET_RELEASED",
          title: {
            romaji: "Ao Haru Ride Movie",
            english: "Blue Spring Ride the Movie",
            native: "アオハライド 劇場版",
          },
          coverImage: { large: "https://placehold.co/100x140", color: "#8aafe5" },
          isAdult: false,
        },
      },
      {
        id: 6,
        relationType: "OTHER",
        node: {
          id: 30006,
          type: "ANIME",
          format: "OVA",
          status: "FINISHED",
          title: {
            romaji: "Restricted Title",
            english: "Restricted Title EN",
            native: null,
          },
          coverImage: { large: "https://placehold.co/100x140", color: "#333333" },
          isAdult: true,
        },
      },
    ],
  },
  characters: {
    edges: [
      {
        id: 1,
        role: "SUPPORTING",
        node: {
          id: 40001,
          name: { full: "Shuko Murao", native: "村緒 修子" },
          image: { large: "https://placehold.co/100x140" },
        },
        voiceActors: [
          {
            id: 50001,
            name: { full: "Ayane Sakura" },
            languageV2: "Japanese",
            image: { large: "https://placehold.co/100x100" },
          },
        ],
      },
      {
        id: 2,
        role: "MAIN",
        node: {
          id: 40002,
          name: { full: "Futaba Yoshioka", native: "吉岡 双葉" },
          image: { large: "https://placehold.co/100x140" },
        },
        voiceActors: [
          {
            id: 50002,
            name: { full: "Marina Inoue" },
            languageV2: "Japanese",
            image: { large: "https://placehold.co/100x100" },
          },
        ],
      },
      {
        id: 3,
        role: "MAIN",
        node: {
          id: 40003,
          name: { full: "Kou Mabuchi", native: "馬渕 洸" },
          image: { large: null },
        },
        voiceActors: [
          {
            id: 50003,
            name: { full: "Yoshimasa Hosoya" },
            languageV2: "Japanese",
            image: { large: "https://placehold.co/100x100" },
          },
        ],
      },
      {
        id: 4,
        role: "SUPPORTING",
        node: {
          id: 40004,
          name: { full: "Toma Kominato", native: "小湊 冬麻" },
          image: { large: "https://placehold.co/100x140" },
        },
        voiceActors: [
          {
            id: 50004,
            name: { full: "Yuki Kaji" },
            languageV2: "Japanese",
            image: { large: "https://placehold.co/100x100" },
          },
        ],
      },
      {
        id: 5,
        role: "SUPPORTING",
        node: {
          id: 40005,
          name: { full: "Yamato Kominato", native: "小湊 大和" },
          image: { large: "https://placehold.co/100x140" },
        },
        voiceActors: [],
      },
      {
        id: 6,
        role: "BACKGROUND",
        node: {
          id: 40006,
          name: { full: "Homeroom Teacher", native: null },
          image: { large: "https://placehold.co/100x140" },
        },
        voiceActors: [
          {
            id: 50005,
            name: { full: "Unshou Ishizuka" },
            languageV2: "Japanese",
            image: { large: "https://placehold.co/100x100" },
          },
        ],
      },
      {
        id: 7,
        role: "MAIN",
        node: {
          id: 40007,
          name: { full: "Narumi Kominato", native: "小湊 楠海" },
          image: { large: "https://placehold.co/100x140" },
        },
        voiceActors: [
          {
            id: 50006,
            name: { full: "Erica Mendez" },
            languageV2: "English",
            image: { large: "https://placehold.co/100x100" },
          },
        ],
      },
      {
        id: 8,
        role: "BACKGROUND",
        node: {
          id: 40008,
          name: { full: "Classmate A", native: null },
          image: { large: "https://placehold.co/100x140" },
        },
        voiceActors: [
          {
            id: 50007,
            name: { full: "Unnamed VA" },
            languageV2: "Japanese",
            image: { large: null },
          },
        ],
      },
    ],
  },
  staff: {
    edges: [
      {
        id: 1,
        role: "Original Creator",
        node: { id: 60001, name: { full: "Io Sakisaka" }, image: { large: "https://placehold.co/100x140" } },
      },
      {
        id: 2,
        role: "Director",
        node: { id: 60002, name: { full: "Yasuhiro Kimura" }, image: { large: null } },
      },
      {
        id: 3,
        role: "Character Design",
        node: { id: 60002, name: { full: "Yasuhiro Kimura" }, image: { large: null } },
      },
      {
        id: 4,
        role: "Series Composition",
        node: { id: 60003, name: { full: "Aya Takaha" }, image: { large: "https://placehold.co/100x140" } },
      },
      {
        id: 5,
        role: "Music",
        node: { id: 60004, name: { full: "Masaru Yokoyama" }, image: { large: "https://placehold.co/100x140" } },
      },
      {
        id: 6,
        role: "Sound Director",
        node: { id: 60005, name: { full: "Yota Tsuruoka" }, image: { large: "https://placehold.co/100x140" } },
      },
    ],
  },
  recommendations: {
    nodes: [
      {
        id: 1,
        rating: 30,
        mediaRecommendation: {
          id: 70001,
          title: {
            romaji: "Kimi ni Todoke",
            english: "From Me to You",
            native: "君に届け",
          },
          coverImage: { large: "https://placehold.co/230x325", color: "#c98a5a" },
          format: "TV",
          isAdult: false,
        },
      },
      {
        id: 2,
        rating: 88,
        mediaRecommendation: {
          id: 70002,
          title: {
            romaji: "Suki tte Ii na yo.",
            english: "Say I Love You",
            native: "好きっていいなよ。",
          },
          coverImage: { large: "https://placehold.co/230x325", color: "#5ac9a1" },
          format: "TV",
          isAdult: false,
        },
      },
      {
        id: 3,
        rating: 12,
        mediaRecommendation: null,
      },
      {
        id: 4,
        rating: 95,
        mediaRecommendation: {
          id: 70004,
          title: {
            romaji: "Restricted Romance",
            english: "Restricted Romance EN",
            native: null,
          },
          coverImage: { large: "https://placehold.co/230x325", color: "#333333" },
          format: "TV",
          isAdult: true,
        },
      },
      {
        id: 5,
        rating: 67,
        mediaRecommendation: {
          id: 70005,
          title: {
            romaji: "Lovely Complex",
            english: null,
            native: "ラブ★コン",
          },
          coverImage: { large: "https://placehold.co/230x325", color: "#d16fa0" },
          format: "TV",
          isAdult: false,
        },
      },
      {
        id: 6,
        rating: 54,
        mediaRecommendation: {
          id: 70006,
          title: {
            romaji: "Orange",
            english: "Orange",
            native: "オレンジ",
          },
          coverImage: { large: null, color: "#e08a4a" },
          format: "TV",
          isAdult: false,
        },
      },
      {
        id: 7,
        rating: 73,
        mediaRecommendation: {
          id: 70007,
          title: {
            romaji: "Fruits Basket",
            english: "Fruits Basket",
            native: "フルーツバスケット",
          },
          coverImage: { large: "https://placehold.co/230x325", color: "#8a6fc9" },
          format: "TV",
          isAdult: false,
        },
      },
      {
        id: 8,
        rating: 41,
        mediaRecommendation: {
          id: 70008,
          title: {
            romaji: "Horimiya",
            english: "Horimiya",
            native: "ホリミヤ",
          },
          coverImage: { large: "https://placehold.co/230x325", color: "#4a9fc9" },
          format: "TV",
          isAdult: false,
        },
      },
      {
        id: 9,
        rating: 60,
        mediaRecommendation: {
          id: 70009,
          title: {
            romaji: "Toradora!",
            english: "Toradora!",
            native: "とらドラ!",
          },
          coverImage: { large: "https://placehold.co/230x325", color: "#c94a4a" },
          format: "TV",
          isAdult: false,
        },
      },
    ],
  },
  externalLinks: [
    { id: 1, url: "https://crunchyroll.com/ao-haru-ride", site: "Crunchyroll", type: "STREAMING", color: "#f47521", icon: null },
    { id: 2, url: "https://netflix.com/title/12345", site: "Netflix", type: "STREAMING", color: null, icon: null },
    { id: 3, url: "https://hulu.com/series/ao-haru-ride", site: "Hulu", type: "STREAMING", color: "#1ce783", icon: null },
    { id: 4, url: "https://anilist.co/anime/20613", site: "AniList", type: "INFO", color: "#02a9ff", icon: null },
    { id: 5, url: "https://myanimelist.net/anime/20613", site: "MyAnimeList", type: "INFO", color: "#2e51a2", icon: null },
    { id: 6, url: "https://twitter.com/aoharuride", site: "Twitter", type: "SOCIAL", color: "#1da1f2", icon: null },
  ],
  trailer: {
    id: "xY7z9Ab3Qw0",
    site: "youtube",
    thumbnail: "https://placehold.co/640x360",
  },
};

export default detailFixture;
