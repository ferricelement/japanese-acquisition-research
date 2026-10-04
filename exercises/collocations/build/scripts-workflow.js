export const meta = {
  name: 'collocation-listening-scripts',
  description: 'One listening script with quiz questions per collocation chunk: write, 3-lens review, fix, recheck until clean',
  phases: [
    { title: 'Write', detail: 'one script per chunk from its brief' },
    { title: 'Review', detail: 'native naturalness, data accuracy, quiz quality' },
    { title: 'Fix', detail: 'apply review findings' },
    { title: 'Recheck', detail: 'combined final check, up to two more fix rounds' },
  ],
}

const ROOT = '/Users/main/Developer/Projects/claude-projects/japanese-acquisition-research'
const CONV = 'exercises/collocations/build/conventions.md'
const VLIST = 'collocations-build/versatility-items.txt'
// Every chunk in course order (from exercises/collocations/build/index.json); args.only picks the script numbers to write.
const ALL = [{"n": 1, "chunkId": "weather-1", "stage": 1, "label": "Rain and snow", "targets": ["c-ame-ga-furu", "c-yuki-ga-furu", "c-ame-ga-yamu", "c-kasa-o-sasu", "c-ame-ni-furareru"], "brief": "exercises/collocations/build/briefs/01-weather-1.json"}, {"n": 2, "chunkId": "body-1", "stage": 1, "label": "Hungry, full, thirsty", "targets": ["c-onaka-ga-suku", "c-onaka-ga-ippai", "c-nodo-ga-kawaku", "c-onaka-ga-heru"], "brief": "exercises/collocations/build/briefs/02-body-1.json"}, {"n": 3, "chunkId": "home-1", "stage": 1, "label": "Out and back", "targets": ["c-uchi-ni-kaeru", "c-uchi-o-deru", "c-soto-ni-deru", "c-kaimono-ni-iku", "c-kaeri-ga-osoi"], "brief": "exercises/collocations/build/briefs/03-home-1.json"}, {"n": 4, "chunkId": "describing-1", "stage": 1, "label": "Looks and voice", "targets": ["c-se-ga-takai", "c-se-ga-hikui", "c-koe-ga-ookii", "c-kami-ga-nagai", "c-sutairu-ga-ii"], "brief": "exercises/collocations/build/briefs/04-describing-1.json"}, {"n": 5, "chunkId": "travel-1", "stage": 1, "label": "Getting on and off", "targets": ["c-densha-ni-noru", "c-basu-ni-noru", "c-kuruma-ni-noru", "c-densha-o-oriru", "c-jitensha-ni-noru"], "brief": "exercises/collocations/build/briefs/05-travel-1.json"}, {"n": 6, "chunkId": "work-school-1", "stage": 1, "label": "School and work days", "targets": ["c-gakkou-ni-iku", "c-shigoto-ni-iku", "c-shigoto-ga-owaru", "c-shigoto-ga-isogashii"], "brief": "exercises/collocations/build/briefs/06-work-school-1.json"}, {"n": 7, "chunkId": "senses-1", "stage": 1, "label": "Feels good or bad", "targets": ["c-kimochi-ga-ii", "c-kimochi-ga-warui", "c-kibun-ga-ii", "c-kigen-ga-warui", "c-igokochi-ga-ii"], "brief": "exercises/collocations/build/briefs/07-senses-1.json"}, {"n": 8, "chunkId": "hobbies-1", "stage": 1, "label": "Read, watch, sing, draw", "targets": ["c-hon-o-yomu", "c-eiga-o-miru", "c-uta-o-utau", "c-e-o-kaku"], "brief": "exercises/collocations/build/briefs/08-hobbies-1.json"}, {"n": 9, "chunkId": "people-1", "stage": 1, "label": "Talking to people", "targets": ["c-hanashi-o-suru", "c-hanashi-o-kiku", "c-hanashi-ga-aru", "c-hanashi-ga-nagai"], "brief": "exercises/collocations/build/briefs/09-people-1.json"}, {"n": 10, "chunkId": "time-money-1", "stage": 1, "label": "No time, no money", "targets": ["c-jikan-ga-nai", "c-hima-ga-nai", "c-okane-ga-nai", "c-okane-ga-tarinai", "c-yoyuu-ga-nai"], "brief": "exercises/collocations/build/briefs/10-time-money-1.json"}, {"n": 11, "chunkId": "weather-2", "stage": 1, "label": "Weather and wind", "targets": ["c-tenki-ga-ii", "c-kaze-ga-tsuyoi", "c-ame-ga-tsuyoi", "c-kaze-ga-fuku", "c-kaze-ni-ataru"], "brief": "exercises/collocations/build/briefs/11-weather-2.json"}, {"n": 12, "chunkId": "body-2", "stage": 1, "label": "Washing and grooming", "targets": ["c-te-o-arau", "c-kao-o-arau", "c-kami-o-arau", "c-kami-o-kiru", "c-tsume-o-kiru"], "brief": "exercises/collocations/build/briefs/12-body-2.json"}, {"n": 13, "chunkId": "home-2", "stage": 1, "label": "Bathroom", "targets": ["c-toire-ni-iku", "c-shawaa-o-abiru", "c-ofuro-ni-hairu", "c-ha-o-migaku", "c-hige-o-soru"], "brief": "exercises/collocations/build/briefs/13-home-2.json"}, {"n": 14, "chunkId": "describing-2", "stage": 1, "label": "Smart and skilled", "targets": ["c-atama-ga-ii", "c-nihongo-ga-jouzu", "c-shigoto-ga-dekiru", "c-sensu-ga-ii"], "brief": "exercises/collocations/build/briefs/14-describing-2.json"}, {"n": 15, "chunkId": "hobbies-2", "stage": 1, "label": "Going out for fun", "targets": ["c-asobi-ni-iku", "c-eiga-ni-iku", "c-sanpo-ni-iku", "c-karaoke-ni-iku"], "brief": "exercises/collocations/build/briefs/15-hobbies-2.json"}, {"n": 16, "chunkId": "work-school-2", "stage": 1, "label": "Questions and learning", "targets": ["c-shitsumon-ga-aru", "c-shitsumon-ni-kotaeru", "c-eigo-o-hanasu", "c-benkyou-ni-naru"], "brief": "exercises/collocations/build/briefs/16-work-school-2.json"}, {"n": 17, "chunkId": "body-3", "stage": 1, "label": "Aches and pains", "targets": ["c-atama-ga-itai", "c-onaka-ga-itai", "c-nodo-ga-itai", "c-koshi-ga-itai", "c-kata-ga-koru"], "brief": "exercises/collocations/build/briefs/17-body-3.json"}, {"n": 18, "chunkId": "people-2", "stage": 1, "label": "Making friends", "targets": ["c-tomodachi-ga-dekiru", "c-tomodachi-ni-naru", "c-namae-o-oshieru", "c-koe-o-kakeru", "c-deai-ga-aru"], "brief": "exercises/collocations/build/briefs/18-people-2.json"}, {"n": 19, "chunkId": "hobbies-3", "stage": 1, "label": "Play and lessons", "targets": ["c-geemu-o-suru", "c-sakkaa-o-suru", "c-piano-o-hiku", "c-piano-o-narau"], "brief": "exercises/collocations/build/briefs/19-hobbies-3.json"}, {"n": 20, "chunkId": "body-4", "stage": 1, "label": "Feeling unwell", "targets": ["c-guai-ga-warui", "c-taichou-ga-warui", "c-choushi-ga-warui", "c-choushi-ga-ii", "c-kibun-ga-warui"], "brief": "exercises/collocations/build/briefs/20-body-4.json"}, {"n": 21, "chunkId": "work-school-3", "stage": 1, "label": "What's on", "targets": ["c-jugyou-ga-aru", "c-kaigi-ga-aru", "c-shiken-ga-aru", "c-shigoto-ga-hairu", "c-enki-ni-naru"], "brief": "exercises/collocations/build/briefs/21-work-school-3.json"}, {"n": 22, "chunkId": "describing-3", "stage": 1, "label": "Luck and help", "targets": ["c-un-ga-ii", "c-un-ga-warui", "c-yaku-ni-tatsu", "c-tame-ni-naru"], "brief": "exercises/collocations/build/briefs/22-describing-3.json"}, {"n": 23, "chunkId": "food-1", "stage": 2, "label": "Drinks", "targets": ["c-mizu-o-nomu", "c-koohii-o-nomu", "c-osake-o-nomu", "c-ocha-o-nomu"], "brief": "exercises/collocations/build/briefs/23-food-1.json"}, {"n": 24, "chunkId": "food-2", "stage": 2, "label": "Meals at home", "targets": ["c-gohan-o-taberu", "c-gohan-o-tsukuru", "c-gohan-ga-dekiru", "c-gohan-ga-sameru"], "brief": "exercises/collocations/build/briefs/24-food-2.json"}, {"n": 25, "chunkId": "body-5", "stage": 2, "label": "Getting sick", "targets": ["c-kaze-o-hiku", "c-kaze-ga-utsuru", "c-byouki-ni-naru", "c-taichou-o-kuzusu", "c-onaka-o-kowasu"], "brief": "exercises/collocations/build/briefs/25-body-5.json"}, {"n": 26, "chunkId": "clothes-1", "stage": 2, "label": "Clothes and shoes", "targets": ["c-fuku-o-kiru", "c-kutsu-o-haku", "c-kutsu-o-nugu", "c-fuku-o-nugu"], "brief": "exercises/collocations/build/briefs/26-clothes-1.json"}, {"n": 27, "chunkId": "media-1", "stage": 2, "label": "TV and music", "targets": ["c-terebi-o-miru", "c-ongaku-o-kiku", "c-nyuusu-o-miru", "c-ongaku-o-kakeru", "c-channeru-o-kaeru"], "brief": "exercises/collocations/build/briefs/27-media-1.json"}, {"n": 28, "chunkId": "home-3", "stage": 2, "label": "Doors and locks", "targets": ["c-doa-o-akeru", "c-doa-o-shimeru", "c-doa-ga-aku", "c-doa-ga-shimaru", "c-kagi-o-kakeru", "c-kagi-ga-kakaru"], "brief": "exercises/collocations/build/briefs/28-home-3.json"}, {"n": 29, "chunkId": "senses-2", "stage": 2, "label": "Noticing", "targets": ["c-nioi-ga-suru", "c-oto-ga-suru", "c-koe-ga-kikoeru", "c-ki-ga-tsuku"], "brief": "exercises/collocations/build/briefs/29-senses-2.json"}, {"n": 30, "chunkId": "people-3", "stage": 2, "label": "Kids and growing up", "targets": ["c-kodomo-ga-iru", "c-kodomo-ga-umareru", "c-otona-ni-naru", "c-kodomo-o-sodateru", "c-mendou-o-miru"], "brief": "exercises/collocations/build/briefs/30-people-3.json"}, {"n": 31, "chunkId": "body-6", "stage": 2, "label": "Cold symptoms", "targets": ["c-netsu-ga-aru", "c-netsu-ga-deru", "c-seki-ga-deru", "c-hanamizu-ga-deru", "c-karada-ga-darui"], "brief": "exercises/collocations/build/briefs/31-body-6.json"}, {"n": 32, "chunkId": "home-4", "stage": 2, "label": "Windows and curtains", "targets": ["c-mado-o-akeru", "c-mado-o-shimeru", "c-kaaten-o-shimeru"], "brief": "exercises/collocations/build/briefs/32-home-4.json"}, {"n": 33, "chunkId": "media-2", "stage": 2, "label": "Photos and your phone", "targets": ["c-shashin-o-toru", "c-shashin-o-miru", "c-sumaho-o-ijiru", "c-shashin-o-okuru"], "brief": "exercises/collocations/build/briefs/33-media-2.json"}, {"n": 34, "chunkId": "senses-3", "stage": 2, "label": "Understanding", "targets": ["c-imi-ga-wakaru", "c-kimochi-ga-wakaru", "c-chigai-ga-wakaru"], "brief": "exercises/collocations/build/briefs/34-senses-3.json"}, {"n": 35, "chunkId": "food-3", "stage": 2, "label": "Eating out", "targets": ["c-gohan-ni-iku", "c-mise-ga-komu", "c-gohan-o-ogoru", "c-ryou-ga-ooi"], "brief": "exercises/collocations/build/briefs/35-food-3.json"}, {"n": 36, "chunkId": "home-5", "stage": 2, "label": "Lights and buttons", "targets": ["c-denki-o-tsukeru", "c-denki-o-kesu", "c-denki-ga-tsuku", "c-botan-o-osu"], "brief": "exercises/collocations/build/briefs/36-home-5.json"}, {"n": 37, "chunkId": "travel-2", "stage": 2, "label": "Catching the train", "targets": ["c-densha-ga-okureru", "c-densha-ni-maniau", "c-densha-ga-deru", "c-densha-ni-okureru", "c-shuuden-ga-nakunaru"], "brief": "exercises/collocations/build/briefs/37-travel-2.json"}, {"n": 38, "chunkId": "body-7", "stage": 2, "label": "Doctor and medicine", "targets": ["c-byouin-ni-iku", "c-kusuri-o-nomu", "c-kusuri-ga-kiku"], "brief": "exercises/collocations/build/briefs/38-body-7.json"}, {"n": 39, "chunkId": "people-4", "stage": 2, "label": "Close and in touch", "targets": ["c-naka-ga-ii", "c-naka-ga-warui", "c-renraku-o-toru", "c-renraku-ga-kuru"], "brief": "exercises/collocations/build/briefs/39-people-4.json"}, {"n": 40, "chunkId": "senses-4", "stage": 2, "label": "Likes, interest, confidence", "targets": ["c-ki-ni-iru", "c-kyoumi-ga-aru", "c-tanoshimi-ni-suru", "c-jishin-ga-aru"], "brief": "exercises/collocations/build/briefs/40-senses-4.json"}, {"n": 41, "chunkId": "time-money-2", "stage": 2, "label": "Ready and how long", "targets": ["c-junbi-ga-dekiru", "c-jikan-ga-kakaru", "c-jikan-ga-tatsu", "c-tema-ga-kakaru"], "brief": "exercises/collocations/build/briefs/41-time-money-2.json"}, {"n": 42, "chunkId": "home-6", "stage": 2, "label": "Bed and waking", "targets": ["c-yume-o-miru", "c-me-ga-sameru", "c-futon-ni-hairu", "c-mezamashi-o-kakeru", "c-kotatsu-ni-hairu"], "brief": "exercises/collocations/build/briefs/42-home-6.json"}, {"n": 43, "chunkId": "weather-3", "stage": 2, "label": "Storms and quakes", "targets": ["c-taifuu-ga-kuru", "c-jishin-ga-okiru", "c-kaminari-ga-naru", "c-tenki-yohou-ga-hazureru"], "brief": "exercises/collocations/build/briefs/43-weather-3.json"}, {"n": 44, "chunkId": "describing-4", "stage": 2, "label": "Personality and mood", "targets": ["c-seikaku-ga-ii", "c-seikaku-ga-warui", "c-kanji-ga-ii", "c-genki-ga-nai"], "brief": "exercises/collocations/build/briefs/44-describing-4.json"}, {"n": 45, "chunkId": "people-5", "stage": 2, "label": "Lies, jokes and complaints", "targets": ["c-uso-o-tsuku", "c-joudan-o-iu", "c-monku-o-iu", "c-guchi-o-iu", "c-naisho-ni-suru"], "brief": "exercises/collocations/build/briefs/45-people-5.json"}, {"n": 46, "chunkId": "body-8", "stage": 2, "label": "Rest and recovery", "targets": ["c-yoko-ni-naru", "c-netsu-ga-sagaru", "c-kaze-ga-naoru", "c-tsukare-ga-toreru"], "brief": "exercises/collocations/build/briefs/46-body-8.json"}, {"n": 47, "chunkId": "time-money-3", "stage": 3, "label": "Costs and paying", "targets": ["c-okane-ga-kakaru", "c-ikura-suru", "c-nedan-ga-takai", "c-okane-o-harau", "c-warikan-ni-suru"], "brief": "exercises/collocations/build/briefs/47-time-money-3.json"}, {"n": 48, "chunkId": "clothes-2", "stage": 3, "label": "Trying clothes on", "targets": ["c-zubon-o-haku", "c-fuku-o-kigaeru", "c-fuku-ga-niau", "c-saizu-ga-au"], "brief": "exercises/collocations/build/briefs/48-clothes-2.json"}, {"n": 49, "chunkId": "time-money-4", "stage": 3, "label": "Are you free?", "targets": ["c-jikan-ga-aku", "c-yotei-ga-aru", "c-tsugou-ga-ii", "c-tsugou-ga-warui"], "brief": "exercises/collocations/build/briefs/49-time-money-4.json"}, {"n": 50, "chunkId": "people-6", "stage": 3, "label": "Seeing people", "targets": ["c-tomodachi-ni-au", "c-uchi-made-okuru", "c-jikka-ni-kaeru", "c-tanjoubi-o-iwau"], "brief": "exercises/collocations/build/briefs/50-people-6.json"}, {"n": 51, "chunkId": "food-4", "stage": 3, "label": "Drinking out", "targets": ["c-nomi-ni-iku", "c-tabako-o-suu", "c-osake-ga-yowai", "c-osake-ga-tsuyoi"], "brief": "exercises/collocations/build/briefs/51-food-4.json"}, {"n": 52, "chunkId": "media-3", "stage": 3, "label": "Phone calls", "targets": ["c-denwa-o-kakeru", "c-denwa-ni-deru", "c-denwa-o-kiru", "c-denwa-ga-naru", "c-denwa-ga-aru", "c-denwa-ga-kakaru"], "brief": "exercises/collocations/build/briefs/52-media-3.json"}, {"n": 53, "chunkId": "travel-3", "stage": 3, "label": "On the way", "targets": ["c-eki-ni-tsuku", "c-michi-ga-komu", "c-seki-ga-aku", "c-eki-o-norisugosu"], "brief": "exercises/collocations/build/briefs/53-travel-3.json"}, {"n": 54, "chunkId": "time-money-5", "stage": 3, "label": "Can't make it", "targets": ["c-youji-ga-aru", "c-asa-ga-hayai", "c-yotei-ga-hairu", "c-senyaku-ga-aru"], "brief": "exercises/collocations/build/briefs/54-time-money-5.json"}, {"n": 55, "chunkId": "home-7", "stage": 3, "label": "Trash and tidying", "targets": ["c-gomi-o-suteru", "c-gomi-o-dasu", "c-heya-o-katazukeru", "c-heya-ga-chirakaru", "c-moto-ni-modosu"], "brief": "exercises/collocations/build/briefs/55-home-7.json"}, {"n": 56, "chunkId": "people-7", "stage": 3, "label": "Favours, sorry, cheer up", "targets": ["c-onegai-ga-aru", "c-meiwaku-o-kakeru", "c-shinpai-o-kakeru", "c-genki-o-dasu"], "brief": "exercises/collocations/build/briefs/56-people-7.json"}, {"n": 57, "chunkId": "travel-4", "stage": 3, "label": "On a trip", "targets": ["c-ryokou-ni-iku", "c-hikouki-ni-noru", "c-hoteru-ni-tomaru", "c-omiyage-o-kau", "c-onsen-ni-hairu"], "brief": "exercises/collocations/build/briefs/57-travel-4.json"}, {"n": 58, "chunkId": "time-money-6", "stage": 3, "label": "Spending and saving", "targets": ["c-okane-o-tsukau", "c-kaado-o-tsukau", "c-okane-o-tameru", "c-pointo-o-tameru"], "brief": "exercises/collocations/build/briefs/58-time-money-6.json"}, {"n": 59, "chunkId": "media-4", "stage": 3, "label": "Numbers and messages", "targets": ["c-bangou-o-oshieru", "c-meeru-o-okuru", "c-meeru-ga-kuru", "c-meeru-o-kaesu"], "brief": "exercises/collocations/build/briefs/59-media-4.json"}, {"n": 60, "chunkId": "food-5", "stage": 3, "label": "How it tastes", "targets": ["c-aji-ga-suru", "c-aji-ga-usui", "c-aji-ga-koi"], "brief": "exercises/collocations/build/briefs/60-food-5.json"}, {"n": 61, "chunkId": "travel-5", "stage": 3, "label": "Picking someone up", "targets": ["c-mukae-ni-iku", "c-nimotsu-o-motsu", "c-kuruma-ni-noseru", "c-kuruma-o-tomeru", "c-konbini-ni-yoru"], "brief": "exercises/collocations/build/briefs/61-travel-5.json"}, {"n": 62, "chunkId": "work-school-4", "stage": 3, "label": "Breaks and time off", "targets": ["c-shigoto-o-yasumu", "c-yasumi-o-toru", "c-kyuukei-o-toru", "c-kaisha-o-yameru"], "brief": "exercises/collocations/build/briefs/62-work-school-4.json"}, {"n": 63, "chunkId": "describing-5", "stage": 3, "label": "Out and about", "targets": ["c-hito-ga-ooi", "c-ninki-ga-aru", "c-ii-fun-iki", "c-hyouban-ga-ii", "c-nimotsu-ga-omoi"], "brief": "exercises/collocations/build/briefs/63-describing-5.json"}, {"n": 64, "chunkId": "people-8", "stage": 3, "label": "Manners and thanks", "targets": ["c-orei-o-iu", "c-keigo-o-tsukau", "c-ki-o-tsukau", "c-osewa-ni-naru", "c-gochisou-ni-naru"], "brief": "exercises/collocations/build/briefs/64-people-8.json"}, {"n": 65, "chunkId": "home-8", "stage": 3, "label": "Kitchen", "targets": ["c-osara-o-arau", "c-oyu-o-wakasu", "c-teeburu-o-fuku"], "brief": "exercises/collocations/build/briefs/65-home-8.json"}, {"n": 66, "chunkId": "hobbies-4", "stage": 3, "label": "Hooked, tickets, winning", "targets": ["c-geemu-ni-hamaru", "c-shiai-ni-katsu", "c-shiai-ni-makeru", "c-chiketto-o-toru"], "brief": "exercises/collocations/build/briefs/66-hobbies-4.json"}, {"n": 67, "chunkId": "travel-6", "stage": 3, "label": "Finding the way", "targets": ["c-hidari-ni-magaru", "c-kado-o-magaru", "c-michi-ni-mayou", "c-michi-o-machigaeru", "c-maigo-ni-naru"], "brief": "exercises/collocations/build/briefs/67-travel-6.json"}, {"n": 68, "chunkId": "work-school-5", "stage": 3, "label": "Homework and grades", "targets": ["c-shukudai-o-suru", "c-shukudai-o-dasu", "c-mondai-o-toku", "c-seiseki-ga-ii"], "brief": "exercises/collocations/build/briefs/68-work-school-5.json"}, {"n": 69, "chunkId": "weather-4", "stage": 3, "label": "Sun and moon", "targets": ["c-hi-ga-kureru", "c-hi-ga-noboru", "c-hi-ga-shizumu", "c-tsuki-ga-deru"], "brief": "exercises/collocations/build/briefs/69-weather-4.json"}, {"n": 70, "chunkId": "food-6", "stage": 4, "label": "Breakfast", "targets": ["c-ocha-o-ireru", "c-satou-o-ireru", "c-pan-o-yaku", "c-asagohan-o-nuku"], "brief": "exercises/collocations/build/briefs/70-food-6.json"}, {"n": 71, "chunkId": "home-9", "stage": 4, "label": "Housework and laundry", "targets": ["c-kaji-o-suru", "c-sentakumono-o-hosu", "c-sentakumono-ga-kawaku", "c-fuku-o-tatamu", "c-soujiki-o-kakeru"], "brief": "exercises/collocations/build/briefs/71-home-9.json"}, {"n": 72, "chunkId": "media-5", "stage": 4, "label": "Power, battery, sound", "targets": ["c-dengen-o-kiru", "c-dengen-o-ireru", "c-juuden-ga-kireru", "c-oto-ga-deru"], "brief": "exercises/collocations/build/briefs/72-media-5.json"}, {"n": 73, "chunkId": "clothes-3", "stage": 4, "label": "Masks and glasses", "targets": ["c-masuku-o-suru", "c-masuku-o-hazusu", "c-megane-o-kakeru", "c-megane-o-hazusu"], "brief": "exercises/collocations/build/briefs/73-clothes-3.json"}, {"n": 74, "chunkId": "work-school-6", "stage": 4, "label": "Exams and results", "targets": ["c-shiken-o-ukeru", "c-ten-o-toru", "c-kekka-ga-deru", "c-shiken-ni-ukaru", "c-shiken-ni-ochiru"], "brief": "exercises/collocations/build/briefs/74-work-school-6.json"}, {"n": 75, "chunkId": "time-money-7", "stage": 4, "label": "Out on errands", "targets": ["c-okane-o-orosu", "c-mise-ga-aku", "c-mise-ga-shimaru", "c-junban-o-matsu"], "brief": "exercises/collocations/build/briefs/75-time-money-7.json"}, {"n": 76, "chunkId": "body-9", "stage": 4, "label": "Long-term health", "targets": ["c-karada-ni-ii", "c-toshi-o-toru", "c-tabako-o-yameru", "c-arerugii-ga-aru"], "brief": "exercises/collocations/build/briefs/76-body-9.json"}, {"n": 77, "chunkId": "senses-5", "stage": 4, "label": "Motivation and mood", "targets": ["c-yaruki-ga-nai", "c-yaruki-ga-deru", "c-genki-ga-deru", "c-tenshon-ga-agaru", "c-sutoresu-ga-tamaru"], "brief": "exercises/collocations/build/briefs/77-senses-5.json"}, {"n": 78, "chunkId": "food-7", "stage": 4, "label": "Fridge and microwave", "targets": ["c-reizouko-ni-ireru", "c-bentou-o-atatameru", "c-futa-o-suru", "c-kigen-ga-kireru"], "brief": "exercises/collocations/build/briefs/78-food-7.json"}, {"n": 79, "chunkId": "people-9", "stage": 4, "label": "Pride and teasing", "targets": ["c-baka-ni-suru", "c-haji-o-kaku", "c-kakkou-o-tsukeru"], "brief": "exercises/collocations/build/briefs/79-people-9.json"}, {"n": 80, "chunkId": "hobbies-5", "stage": 4, "label": "Exercise and outdoors", "targets": ["c-karada-o-ugokasu", "c-kibarashi-ni-naru", "c-yama-ni-noboru", "c-tsuri-ni-iku", "c-kyanpu-ni-iku"], "brief": "exercises/collocations/build/briefs/80-hobbies-5.json"}, {"n": 81, "chunkId": "media-6", "stage": 4, "label": "Internet and apps", "targets": ["c-netto-de-shiraberu", "c-netto-ga-tsunagaru", "c-denpa-ga-warui", "c-apuri-o-ireru"], "brief": "exercises/collocations/build/briefs/81-media-6.json"}, {"n": 82, "chunkId": "time-money-8", "stage": 4, "label": "Plans and promises", "targets": ["c-yousu-o-miru", "c-chuushi-ni-naru", "c-yakusoku-o-mamoru", "c-keikaku-o-tateru"], "brief": "exercises/collocations/build/briefs/82-time-money-8.json"}, {"n": 83, "chunkId": "clothes-4", "stage": 4, "label": "Hats and accessories", "targets": ["c-boushi-o-kaburu", "c-yubiwa-o-suru", "c-nekutai-o-suru", "c-kousui-o-tsukeru"], "brief": "exercises/collocations/build/briefs/83-clothes-4.json"}, {"n": 84, "chunkId": "work-school-7", "stage": 4, "label": "University and jobs", "targets": ["c-shigoto-o-sagasu", "c-shigoto-ga-mitsukaru", "c-daigaku-ni-hairu", "c-kaisha-ni-hairu", "c-keiken-ga-aru"], "brief": "exercises/collocations/build/briefs/84-work-school-7.json"}, {"n": 85, "chunkId": "body-10", "stage": 4, "label": "Visible signs", "targets": ["c-kega-o-suru", "c-chi-ga-deru", "c-ase-o-kaku", "c-kaoiro-ga-warui", "c-kao-ga-akai"], "brief": "exercises/collocations/build/briefs/85-body-10.json"}, {"n": 86, "chunkId": "weather-5", "stage": 4, "label": "Seasons", "targets": ["c-hana-ga-saku", "c-atsusa-ni-yowai", "c-semi-ga-naku", "c-yuki-ga-tsumoru"], "brief": "exercises/collocations/build/briefs/86-weather-5.json"}, {"n": 87, "chunkId": "home-10", "stage": 4, "label": "Your place", "targets": ["c-heya-o-kariru", "c-semai-heya", "c-inu-o-kau", "c-nimotsu-ga-todoku"], "brief": "exercises/collocations/build/briefs/87-home-10.json"}, {"n": 88, "chunkId": "people-10", "stage": 4, "label": "Worries and advice", "targets": ["c-nayami-ga-aru", "c-soudan-ga-aru", "c-soudan-ni-noru", "c-honne-o-iu"], "brief": "exercises/collocations/build/briefs/88-people-10.json"}, {"n": 89, "chunkId": "time-money-9", "stage": 4, "label": "Using your time", "targets": ["c-jikan-o-kakeru", "c-jikan-o-toru", "c-jikan-o-tsukuru", "c-jikan-o-tsubusu"], "brief": "exercises/collocations/build/briefs/89-time-money-9.json"}, {"n": 90, "chunkId": "work-school-8", "stage": 4, "label": "Getting work done", "targets": ["c-atama-o-tsukau", "c-kekka-o-dasu", "c-memo-o-toru", "c-aidea-ga-ukabu", "c-hanko-o-osu"], "brief": "exercises/collocations/build/briefs/90-work-school-8.json"}, {"n": 91, "chunkId": "senses-6", "stage": 4, "label": "When it hits you", "targets": ["c-namida-ga-deru", "c-torihada-ga-tatsu", "c-jikkan-ga-waku"], "brief": "exercises/collocations/build/briefs/91-senses-6.json"}, {"n": 92, "chunkId": "hobbies-6", "stage": 4, "label": "Seasonal outings", "targets": ["c-hanami-ni-iku", "c-hatsumoude-ni-iku", "c-omikuji-o-hiku"], "brief": "exercises/collocations/build/briefs/92-hobbies-6.json"}, {"n": 93, "chunkId": "body-11", "stage": 4, "label": "Moving your body", "targets": ["c-te-o-ageru", "c-me-o-tojiru", "c-chikara-o-nuku"], "brief": "exercises/collocations/build/briefs/93-body-11.json"}, {"n": 94, "chunkId": "describing-6", "stage": 4, "label": "Body and fitness", "targets": ["c-me-ga-warui", "c-ashi-ga-hayai", "c-undou-shinkei-ga-ii", "c-tairyoku-ga-aru"], "brief": "exercises/collocations/build/briefs/94-describing-6.json"}]
const ITEMS = args && args.only ? ALL.filter((x) => args.only.includes(x.n)) : ALL

const STR = { type: 'string' }
const SCRIPT = {
  type: 'object',
  required: ['chunkId', 'title', 'format', 'register', 'setting', 'speakers', 'lines', 'questions', 'newWords', 'reviewUsed'],
  properties: {
    chunkId: STR,
    title: STR,
    format: { type: 'string', enum: ['dialogue', 'monologue'] },
    register: { type: 'string', enum: ['casual', 'polite', 'mixed'] },
    setting: STR,
    speakers: { type: 'array', items: { type: 'object', required: ['id', 'name', 'voice'], properties: { id: STR, name: STR, voice: STR } } },
    lines: {
      type: 'array',
      items: {
        type: 'object', required: ['speaker', 'romaji', 'ja', 'kana', 'english', 'uses'],
        properties: { speaker: STR, romaji: STR, ja: STR, kana: STR, english: STR, uses: { type: 'array', items: STR } },
      },
    },
    questions: {
      type: 'array',
      items: {
        type: 'object',
        required: ['type', 'targets', 'english', 'ja', 'kana', 'romaji', 'choices', 'answer', 'modelAnswers', 'explanation'],
        properties: {
          type: { type: 'string', enum: ['gist', 'heard', 'meaning', 'respond'] },
          targets: { type: 'array', items: STR },
          english: STR, ja: STR, kana: STR, romaji: STR,
          choices: {
            type: 'array',
            items: { type: 'object', required: ['key', 'english', 'romaji'], properties: { key: STR, english: STR, romaji: { type: ['string', 'null'] } } },
          },
          answer: STR,
          modelAnswers: { type: 'array', items: { type: 'object', required: ['romaji', 'ja', 'english'], properties: { romaji: STR, ja: STR, english: STR } } },
          explanation: STR,
        },
      },
    },
    newWords: { type: 'array', items: { type: 'object', required: ['romaji', 'ja', 'english'], properties: { romaji: STR, ja: STR, english: STR } } },
    reviewUsed: { type: 'array', items: STR },
  },
}
const ISSUES = {
  type: 'object',
  required: ['issues'],
  properties: {
    issues: {
      type: 'array',
      items: {
        type: 'object', required: ['where', 'severity', 'problem', 'fix'],
        properties: { where: STR, severity: { type: 'string', enum: ['blocking', 'minor'] }, problem: STR, fix: STR },
      },
    },
  },
}

const targetList = (it) => it.targets.join(', ')
const reviewIds = (it) => new Set(ALL.filter((x) => x.n < it.n).flatMap((x) => x.targets))
const show = (s) => JSON.stringify(s, null, 1)

// Rule checks code can do; the rest is for the reviewers.
function ruleIssues(s, it) {
  const out = []
  const add = (where, problem, severity = 'blocking') => out.push({ where, severity, problem, fix: '' })
  if (!s) return [{ where: 'script', severity: 'blocking', problem: 'no script', fix: '' }]
  const ids = new Set(s.speakers.map((sp) => sp.id))
  const allowed = new Set([...it.targets, ...reviewIds(it)])
  s.lines.forEach((l, i) => {
    if (!ids.has(l.speaker)) add(`line ${i + 1}`, `speaker "${l.speaker}" is not in speakers`)
    l.uses.filter((u) => !allowed.has(u)).forEach((u) => add(`line ${i + 1}`, `uses "${u}" is neither a target nor an earlier chunk's collocation`))
    if (/[A-Z]/.test(l.romaji)) add(`line ${i + 1}`, 'romaji has capital letters (all lowercase, names too)')
    if (/[āīūēōÂÎÛÊÔâîûêô]/.test(l.romaji)) add(`line ${i + 1}`, 'romaji has macrons or circumflexes')
  })
  const [lo, hi] = s.format === 'monologue' ? [7, 12] : [10, 18]
  if (s.lines.length < lo || s.lines.length > hi) add('lines', `${s.lines.length} lines; a ${s.format} has ${lo}-${hi}`, 'minor')
  for (const t of it.targets) {
    const heard = s.lines.filter((l) => l.uses.includes(t)).length
    if (heard < 2) add(t, `target heard in ${heard} line(s); every target must be heard at least twice`)
  }
  const qs = s.questions
  if (!qs.length || qs[0].type !== 'gist') add('question 1', 'the first question must be the gist question')
  if (qs.filter((q) => q.type === 'gist').length !== 1) add('questions', 'exactly one gist question')
  for (const t of it.targets) {
    const n = qs.filter((q) => q.type !== 'gist' && q.targets.includes(t)).length
    if (n !== 1) add(t, `${n} questions target it; each target gets exactly one question`)
  }
  const respond = qs.filter((q) => q.type === 'respond').length
  if (respond < Math.ceil(it.targets.length / 2)) add('questions', `${respond} respond questions; needs at least ${Math.ceil(it.targets.length / 2)}`)
  if (it.targets.length >= 3 && !['heard', 'meaning', 'respond'].every((ty) => qs.some((q) => q.type === ty))) add('questions', 'with 3+ targets, use heard, meaning and respond', 'minor')
  qs.forEach((q, i) => {
    const w = `question ${i + 1}`
    if (q.type === 'respond') {
      if (q.choices.length) add(w, 'respond questions have no choices')
      if (q.modelAnswers.length < 2) add(w, 'respond questions need two model answers')
    } else {
      if (q.choices.length !== 3) add(w, `${q.choices.length} choices; needs 3`)
      if (!q.choices.some((c) => c.key === q.answer)) add(w, `answer "${q.answer}" is not one of the choice keys`)
      if (q.type === 'heard' && q.choices.some((c) => !c.romaji)) add(w, 'heard choices need romaji')
    }
  })
  const keys = qs.filter((q) => q.type !== 'respond').map((q) => q.answer)
  if (keys.length >= 3 && new Set(keys).size === 1) add('questions', `every answer is ${keys[0]}; vary the keys`, 'minor')
  return out
}

const header = (it) => `Working directory: ${ROOT} (paths below are relative to it).
Script ${it.n} of ${ALL.length}, Stage ${it.stage}, chunk "${it.label}" (${it.chunkId}).
Rules: ${CONV}. Brief (targets with their traps and mix-ups, the review pool, suggested cast): ${it.brief}.
Allowed words: ${VLIST} (5th column = stage; Stage ${it.stage} or below).`

const writePrompt = (it) => `${header(it)}

Write the listening script and quiz for this chunk. Read the conventions and the brief in full first. For the kind of
material, you can skim one story in exercises/stage-1/listening-stories.json (same format, but those were built around
single words; yours is built around this chunk's collocations: ${targetList(it)}).

Hard requirements (checked by code): chunkId "${it.chunkId}"; every target heard in at least two lines and tagged in
those lines' \`uses\`; \`uses\` holds only these targets or earlier chunks' collocations from the brief's reviewPool;
first question gist; then exactly one question per target; at least ${Math.ceil(it.targets.length / 2)} respond
questions; choice questions have exactly 3 choices; respond questions have no choices and two model answers; romaji all
lowercase with no macrons. Make it a scene worth listening to, in Japanese a native speaker would actually say.`

const LENSES = [
  {
    key: 'native',
    prompt: `You are a native Japanese speaker and an experienced teacher of Japanese to English speakers. Check every
line, every question's spoken Japanese, and every model answer:
- Would a native speaker say exactly this, in this situation, to this person? Particles, verb choice, word order,
  sentence endings, contractions, gendered speech, politeness that matches the relationships in the conventions.
- Is each target collocation used in its core sense and natural form (not a drill, not forced, not translationese)?
- Where the brief's mix-ups note pits two items against each other, can the listener hear the contrast?
- Is the scene plausible and coherent, with a point the gist question can ask about?
Blocking = Japanese that is wrong or unnatural, a collocation used in the wrong sense, wrong register for the
relationship. Minor = could be smoother. For each issue give the exact place and the corrected ja + romaji + kana.`,
  },
  {
    key: 'data',
    prompt: `You are the data editor. Check, line by line and in every question and model answer:
- romaji, ja and kana say exactly the same thing; romaji follows the conventions (lowercase, no macrons, long vowels as
  spelled, wa/o/e particles, tch, n' before a vowel or y, inflections attached, particles separate); kana is the
  correct full hiragana reading of ja in context (check every kanji reading); English is faithful and natural.
- \`uses\`: every tagged collocation really occurs in that line (any inflection; a dropped particle is fine), and every
  occurrence of a target or review collocation is tagged. reviewUsed matches the review ids that appear.
- newWords: every content word outside the allowed words (Stage {stage} or below of the versatility list, the
  chunk's targets, the review pool) is listed, with correct romaji, ja and gloss; nothing listed twice.
- speakers: cast voices exactly as in the conventions.
Blocking = a mismatch between romaji, ja and kana, a wrong kanji reading, a wrong tag, a wrong translation, a missing new
word. Minor = style. Give exact place and the corrected value.`,
  },
  {
    key: 'quiz',
    prompt: `You are a listening-test editor. Take the place of a learner who heard the audio once and cannot read it:
- Can every question be answered by ear? Is exactly one choice right, with the wrong ones plausible but clearly wrong
  given what was heard? Does a heard question's wrong choice accidentally match something that was also said, or is it
  also natural in that moment (then it's ambiguous)? Are heard distractors real English-speaker mistakes (the target's
  trap, a calque) or the chunk's contrast partner?
- Does each meaning question test the collocation, not a trivial detail? Does the gist question have a real answer?
- Does each respond cue make the target the natural reply, and do both model answers use the target naturally?
- Are explanations accurate, citing the right lines, saying why each wrong choice is wrong? Do answer keys vary?
Blocking = ambiguous or unanswerable question, wrong answer key, wrong explanation, a respond cue that doesn't lead
to the target. Minor = could be sharper. Give the exact place and a concrete rewrite.`,
  },
]

const reviewPrompt = (lens, it, s) => `${header(it)}

${lens.prompt.replace('{stage}', String(it.stage))}

Read the conventions and the brief first. Report only real problems; an empty list is fine. The script:
${show(s)}`

const fixPrompt = (it, s, issues) => `${header(it)}

Revise this listening script. Fix every blocking issue below, and every minor one you agree with. Keep the scene,
cast, chunkId and targets unless an issue needs them changed. Re-read the conventions and brief; everything they
require still holds after your edits (each target heard at least twice and tagged, one question per target, at least
${Math.ceil(it.targets.length / 2)} respond questions, romaji/ja/kana in step). Return the complete revised script.

Issues:
${show(issues)}

The script:
${show(s)}`

const recheckPrompt = (it, s) => `${header(it)}

Final check of a listening script that has already been reviewed and revised. You are a native Japanese teacher and a
careful editor at once. Read the conventions and the brief, then check:
1. Naturalness: every line, cue and model answer is what a native would say here, to this person; targets in their
   core sense; register fits the relationships.
2. Data: romaji, ja and kana match word for word; correct kanji readings; romaji conventions; faithful English;
   \`uses\` tags true and complete; new words listed (Stage ${it.stage} or below of the versatility list is allowed).
3. Quiz: answerable by ear; exactly one right choice; plausible wrong choices; respond cues lead to the target; model
   answers natural; explanations accurate.
Report only real problems. Blocking = something a learner would learn wrong, or a question that's ambiguous or
wrong. The script:
${show(s)}`

const valid = (s, it) => s && s.chunkId === it.chunkId && Array.isArray(s.lines) && s.lines.length > 0

async function fixRound(it, s, issues, label) {
  const r = await agent(fixPrompt(it, s, issues), { label, phase: 'Fix', schema: SCRIPT })
  return valid(r, it) ? r : s
}

const results = await pipeline(
  ITEMS,
  async (it) => {
    let s = await agent(writePrompt(it), { label: `write:${it.n}`, phase: 'Write', schema: SCRIPT })
    if (s && s.chunkId !== it.chunkId) s.chunkId = it.chunkId
    if (!valid(s, it)) s = await agent(writePrompt(it), { label: `write:${it.n}:retry`, phase: 'Write', schema: SCRIPT })
    return s
  },
  async (s, it) => {
    if (!valid(s, it)) return { it, s: null, issues: [] }
    const found = await parallel(LENSES.map((lens) => () =>
      agent(reviewPrompt(lens, it, s), { label: `${lens.key}:${it.n}`, phase: 'Review', schema: ISSUES })
        .then((r) => (r ? r.issues.map((x) => ({ ...x, lens: lens.key })) : []))))
    return { it, s, issues: [...ruleIssues(s, it), ...found.filter(Boolean).flat()] }
  },
  async ({ it, s, issues }) => {
    if (!s) return { n: it.n, chunkId: it.chunkId, script: null, rounds: 0, remaining: [{ problem: 'writer failed' }], reviewed: 0 }
    const reviewed = issues.length
    let cur = issues.length ? await fixRound(it, s, issues, `fix:${it.n}`) : s
    let remaining = []
    let rounds = 1
    for (; rounds <= 3; rounds++) {
      const r = await agent(recheckPrompt(it, cur), { label: `recheck:${it.n}:${rounds}`, phase: 'Recheck', schema: ISSUES })
      remaining = [...ruleIssues(cur, it), ...((r && r.issues) || [])].filter((x) => x.severity === 'blocking')
      if (!remaining.length || rounds === 3) break
      cur = await fixRound(it, cur, remaining, `fix:${it.n}:${rounds + 1}`)
    }
    // A fix after the third recheck would go unchecked, so whatever is still blocking is reported instead.
    log(`script ${it.n} (${it.label}): ${reviewed} review findings, ${rounds} recheck(s), ${remaining.length} still blocking`)
    return { n: it.n, chunkId: it.chunkId, script: cur, rounds, reviewed, remaining }
  },
)

const done = results.filter(Boolean)
log(`${done.filter((r) => r.script).length}/${ITEMS.length} scripts written; ${done.filter((r) => r.remaining.length).length} with blocking issues left`)
return { scripts: done }
