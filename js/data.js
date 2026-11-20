// دوّاسة – بيانات تراكات الدراجات في الإمارات (مصادر عامة، تم التحقق: 21 نوفمبر 2026)
// الإحداثيات من Mapbox. اللي عليها approx: true تقريبية ولازم تتأكد منها.

export const VERIFIED = '2026-11-21';

const C = 'https://upload.wikimedia.org/wikipedia/commons/';
const TH = (path, file, w = 1280) => `${C}thumb/${path}/${file}/${w}px-${file}`;
export const PHOTOS = {
  qudra: { src: TH('1/1c', 'Sunrise_on_Al_Qudra_Cycling_track_-_October_2023.jpg'), by: 'Iamfinehere', lic: 'CC0', page: 'File:Sunrise_on_Al_Qudra_Cycling_track_-_October_2023.jpg', place: 'القدرة' },
  qudraOryx: { src: TH('e/ea', 'Oryx_on_the_Cycling_track_in_Al_Qudra%2C_Dubai_-_May_2023.jpg'), by: 'Iamfinehere', lic: 'CC0', page: 'File:Oryx_on_the_Cycling_track_in_Al_Qudra,_Dubai_-_May_2023.jpg', place: 'القدرة' },
  yas: { src: TH('2/28', 'Yas_Marina_Circuit_%2B_Ferrari_World_-Abu_Dhabi.jpg'), by: 'Dapaan', lic: 'CC BY-SA 3.0', page: 'File:Yas_Marina_Circuit_%2B_Ferrari_World_-Abu_Dhabi.jpg', place: 'حلبة مرسى ياس' },
  jais: { src: TH('a/ad', 'Jebel_Jais_road_III.jpg'), by: 'Montaserarqob', lic: 'CC BY-SA 4.0', page: 'File:Jebel_Jais_road_III.jpg', place: 'طريق جبل جيس' },
  hafit: { src: TH('b/b7', 'Jebel_Hafeet_-_Aerial_View.jpg'), by: 'Nicolascornet', lic: 'CC BY-SA 4.0', page: 'File:Jebel_Hafeet_-_Aerial_View.jpg', place: 'جبل حفيت' },
  hatta: { src: TH('c/c7', 'Hiking_trail_by_the_artificial_flowing_water_troughs_used_by_farms_in_Hatta_Dubai.jpg'), by: 'Lu2aidris', lic: 'CC BY-SA 4.0', page: 'File:Hiking_trail_by_the_artificial_flowing_water_troughs_used_by_farms_in_Hatta_Dubai.jpg', place: 'حتّا' },
  shawka: { src: TH('5/59', 'Mountains_of_Wadi_Shawka_denoised.jpg'), by: 'Florian Kriechbaumer / Aristeas', lic: 'CC BY-SA 4.0', page: 'File:Mountains_of_Wadi_Shawka_denoised.jpg', place: 'وادي الشوكة' },
};

// type: road | mtb | circuit | climb | urban | park
// lit: full | partial | none | unknown
// fac: rental shower locker cafe water parking toilet prayer shade repair kids
export const TRACKS = [
  { id: 'al-qudra', name: 'مسار القدرة (سيح السلام)', en: 'Al Qudra Cycle Track', emirate: 'دبي', area: 'سيح السلام', type: 'road', lat: 24.9990, lng: 55.3070, len: 50, lenText: 'اللفة الرئيسية 50 كم (35 كم بالطريق المختصر)، والشبكة حوالي 86 كم وتوصل 180 كم مع الامتدادات', loops: ['35 كم', '50 كم', '86 كم'], gain: 90, surface: 'أسفلت', hours: 'مفتوح 24 ساعة', lit: 'partial', litNote: 'الإنارة بس عند البداية وفي «The Stick» (خط مستقيم 17.5 كم)', fee: 'مجاني', fac: ['rental', 'cafe', 'water', 'parking', 'shade'], authority: 'حكومة دبي', rules: 'الأفضل قبل 9 الصبح في الصيف. حمّل ماي كفاية، المظلات تقريباً كل 10 كم.', family: false, women: false, loop: true, photo: 'qudra', src: ['https://www.bayut.com/mybayut/al-qudra-cycle-track', 'https://pickyourtrail.com/attractions/dubai/al-qudra-cycle-track-dubai'] },
  { id: 'nad-al-sheba', name: 'حديقة ند الشبا للدراجات', en: 'Nad Al Sheba Cycle Park', emirate: 'دبي', area: 'ند الشبا – ميدان', type: 'circuit', lat: 25.1492, lng: 55.2862, len: 8, lenText: 'لفات 4 و6 و8 كم، ولفة أطفال 850 م', loops: ['4 كم', '6 كم', '8 كم', '850 م أطفال'], gain: 10, surface: 'أسفلت', hours: 'مفتوح 24 ساعة', lit: 'full', fee: 'مجاني', fac: ['shower', 'locker', 'toilet', 'parking', 'kids', 'cafe'], authority: 'حكومة دبي', rules: 'مناسب للعوائل والتدريب الليلي.', family: true, women: false, loop: true, src: ['https://www.bayut.com/mybayut/nad-al-sheba-cycle-park-dubai/', 'https://www.dubizzle.com/blog/cars/nad-al-sheba-cycle-park/'] },
  { id: 'hatta-mtb', name: 'مركز حتّا للدراجات الجبلية', en: 'Hatta MTB Trail Centre', emirate: 'دبي', area: 'حتّا', type: 'mtb', lat: 24.8123, lng: 56.1588, len: 50, lenText: 'حوالي 50 كم مسارات مصنّفة بالألوان (أخضر، أزرق، أحمر، أسود)', loops: ['أخضر', 'أزرق', 'أحمر', 'أسود'], gain: null, surface: 'مسارات جبلية ضيقة', hours: 'مفتوح 24 ساعة', lit: 'none', fee: 'مجاني بدراجتك، والإيجار في Hatta Wadi Hub', fac: ['rental', 'parking', 'toilet', 'cafe', 'repair'], authority: 'Hatta Wadi Hub', rules: 'لا تركب بروحك في المسارات الحمراء والسوداء. يتسكّر تلقائياً لما يكون في توقعات مطر.', family: false, women: false, loop: false, photo: 'hatta', src: ['https://thenationalnews.com/lifestyle/travel/visitors-to-hatta-wadi-hub-s-mountain-trails-can-now-rent-bikes-and-take-guided-tours-1.1052071'] },
  { id: 'mushrif-mtb', name: 'مسارات مشرف للدراجات الجبلية', en: 'Mushrif Park MTB Trails', emirate: 'دبي', area: 'حديقة مشرف الوطنية', type: 'mtb', lat: 25.2250, lng: 55.4506, approx: true, len: 50, lenText: 'شبكة 50 كم فيها مسار محترفين ومنطقة مهارات (أخضر، أزرق، أحمر)، ومسار أطفال «Young Rangers»', loops: ['أخضر', 'أزرق', 'أحمر', 'أطفال'], gain: null, surface: 'رمل وغابة غاف', hours: 'حسب مواعيد الحديقة', lit: 'none', fee: 'دخول الحديقة 10 دراهم للسيارة', fac: ['parking', 'toilet', 'kids', 'shade'], authority: 'بلدية دبي', rules: 'انتبه للمشاة عند تقاطع مسار المشي.', family: true, women: false, loop: false, src: ['https://www.dm.gov.ae/?p=364076', 'https://www.dm.gov.ae/?p=373748'] },
  { id: 'jumeirah-beach', name: 'مسار شاطئ جميرا', en: 'Jumeirah Beach Cycle Track', emirate: 'دبي', area: 'جميرا', type: 'urban', lat: 25.2030, lng: 55.2430, approx: true, len: 16, lenText: '16 كم بعرض 4 م من قناة دبي المائية لين حديقة أم سقيم', loops: [], gain: 5, surface: 'أسفلت ملوّن', hours: 'مفتوح', lit: 'unknown', fee: 'مجاني', fac: ['water', 'toilet'], authority: 'هيئة الطرق والمواصلات', rules: 'السرعة القصوى 20 كم/س.', family: true, women: false, loop: false, src: ['https://www.mediaoffice.ae/en/news/2022/feb/10-02/rta-opens-16-km-cycling-track-at-jumeirah-beach'] },
  { id: 'khawaneej-mushrif', name: 'شبكة مسارات الخوانيج ومشرف', en: 'Al Khawaneej & Mushrif tracks', emirate: 'دبي', area: 'الخوانيج', type: 'urban', lat: 25.2290, lng: 55.4720, approx: true, len: 39, lenText: 'حوالي 39 كم مسارات متصلة داخل الأحياء', loops: [], gain: 20, surface: 'أسفلت', hours: 'مفتوح', lit: 'unknown', fee: 'مجاني', fac: [], authority: 'هيئة الطرق والمواصلات', rules: 'مسارات أحياء، انتبه للتقاطعات.', family: true, women: false, loop: false, src: ['https://mediaoffice.ae/en/news/2024/march/10-03/rta-opens-new-cycling-tracks'] },
  { id: 'park-mushrif', name: 'مسار حديقة مشرف', en: 'Mushrif Park track', emirate: 'دبي', area: 'حدائق دبي', type: 'park', lat: null, lng: null, len: 4, lenText: '4 كم', loops: [], surface: 'أسفلت', hours: '8 الصبح – 10 الليل', lit: 'unknown', fee: 'رسوم الحديقة', fac: ['parking', 'toilet', 'kids'], authority: 'بلدية دبي', family: true, src: ['https://rta.ae/wps/portal/rta/ae/home/about-rta/cycling-track'] },
  { id: 'park-quranic', name: 'مسار الحديقة القرآنية', en: 'Quranic Park track', emirate: 'دبي', area: 'حدائق دبي', type: 'park', lat: null, lng: null, len: 3.2, lenText: '3.2 كم', loops: [], surface: 'أسفلت', hours: '8 الصبح – 10 الليل', lit: 'unknown', fee: '', fac: ['parking', 'toilet'], authority: 'بلدية دبي', family: true, src: ['https://rta.ae/wps/portal/rta/ae/home/about-rta/cycling-track'] },
  { id: 'park-warqaa', name: 'مسار حديقة الورقاء', en: 'Al Warqaa Park track', emirate: 'دبي', area: 'حدائق دبي', type: 'park', lat: null, lng: null, len: 3, lenText: '3 كم', loops: [], surface: 'أسفلت', hours: '8 الصبح – 10 الليل', lit: 'unknown', fee: '', fac: ['parking', 'toilet', 'kids'], authority: 'بلدية دبي', family: true, src: ['https://rta.ae/wps/portal/rta/ae/home/about-rta/cycling-track?lang=ar'] },
  { id: 'park-barsha-south', name: 'مسار حديقة البرشاء جنوب', en: 'Al Barsha South Park track', emirate: 'دبي', area: 'حدائق دبي', type: 'park', lat: null, lng: null, len: 2, lenText: '2 كم', loops: [], surface: 'أسفلت', hours: '8 الصبح – 10 الليل', lit: 'unknown', fee: '', fac: ['parking', 'toilet', 'kids'], authority: 'بلدية دبي', family: true, src: ['https://rta.ae/wps/portal/rta/ae/home/about-rta/cycling-track'] },
  { id: 'park-khawaneej-pond', name: 'مسار حديقة بحيرة الخوانيج', en: 'Al Khawaneej Pond Park track', emirate: 'دبي', area: 'حدائق دبي', type: 'park', lat: null, lng: null, len: 2, lenText: '2 كم', loops: [], surface: 'أسفلت', hours: '8 الصبح – 10 الليل', lit: 'unknown', fee: '', fac: ['parking', 'toilet'], authority: 'بلدية دبي', family: true, src: ['https://propertyfinder.ae/blog/cycling-tracks-dubai'] },
  { id: 'park-barsha-pond', name: 'مسار حديقة بحيرة البرشاء', en: 'Al Barsha Pond Park track', emirate: 'دبي', area: 'حدائق دبي', type: 'park', lat: null, lng: null, len: 1.45, lenText: '1.45 كم', loops: [], surface: 'أسفلت', hours: '8 الصبح – 10 الليل', lit: 'unknown', fee: '', fac: ['parking', 'toilet', 'kids'], authority: 'بلدية دبي', family: true, src: ['https://rta.ae/wps/portal/rta/ae/home/about-rta/cycling-track?lang=ar'] },
  { id: 'hudayriyat', name: 'مسار الحديريات', en: 'Hudayriyat Cycle Track', emirate: 'أبوظبي', area: 'جزيرة الحديريات', type: 'circuit', lat: 24.4175, lng: 54.3476, len: 28, lenText: 'حوالي 28 كم، ولفات من 1 لين 10 كم فيها جزء فوق البحر', loops: ['1 كم', '3 كم', '5 كم', '10 كم'], gain: 10, surface: 'أسفلت', hours: '5 الصبح – 12 الليل', lit: 'full', fee: 'مجاني', fac: ['rental', 'shower', 'locker', 'cafe', 'parking', 'toilet', 'kids'], authority: 'جزيرة الحديريات – نادي أبوظبي للدراجات', rules: 'اللفات القصيرة للأطفال والمبتدئين، ولفة 10 كم للتدريب.', family: true, women: false, loop: true, src: ['https://www.hudayriyatisland.ae/en/play/cycling-track', 'https://gulfnews.com/lifestyle/where-to-ride-in-abu-dhabi-the-best-cycling-spots-in-and-around-the-city-1.500744549'] },
  { id: 'trail-x', name: 'Trail X للدراجات الجبلية', en: 'Trail X MTB', emirate: 'أبوظبي', area: 'جزيرة الحديريات', type: 'mtb', lat: 24.4200, lng: 54.3312, len: 15, lenText: '15 كم بأربع مستويات (أخضر، أزرق، أحمر، أسود)', loops: ['أخضر', 'أزرق', 'أحمر', 'أسود'], gain: null, surface: 'مسار جبلي مصمم', hours: 'حسب مواعيد الجزيرة', lit: 'unknown', fee: '', fac: ['rental', 'parking', 'toilet'], authority: 'جزيرة الحديريات', rules: 'يتسكّر تلقائياً لما يكون في توقعات مطر.', family: false, women: false, loop: false, src: ['https://www.mediaoffice.abudhabi/en/sport/khaled-bin-mohamed-bin-zayed-inaugurates-trail-x-mountain-biking-facility'] },
  { id: 'yas-circuit', name: 'حلبة مرسى ياس (TrainYAS)', en: 'Yas Marina Circuit – TrainYAS', emirate: 'أبوظبي', area: 'جزيرة ياس', type: 'circuit', lat: 24.4766, lng: 54.6063, len: 5.281, lenText: 'حلبة الفورمولا 1 بطول 5.281 كم', loops: ['5.281 كم'], gain: 15, surface: 'أسفلت حلبة', hours: 'جلسات مجانية: TrainYAS للكل، TrainYAS Ladies الثلاثاء 6–9 المسا، وTrainAM الصبح', lit: 'full', fee: 'مجاني مع تسجيل وبطاقة عضوية', fac: ['rental', 'toilet', 'parking', 'water'], authority: 'حلبة مرسى ياس', rules: 'لازم تسجّل أونلاين. دراجات مجانية لعمر 12 وفوق. الجدول يتغير حسب الموسم ويتسكّر حول سباق الجائزة الكبرى (3–6 ديسمبر 2026).', family: true, women: true, loop: true, photo: 'yas', src: ['https://www.yasmarinacircuit.com/en/trainyas', 'https://www.yasmarinacircuit.com/healthandfitness/trainyas-ladies'] },
  { id: 'al-wathba', name: 'مسار الوثبة', en: 'Al Wathba Cycle Track', emirate: 'أبوظبي', area: 'الوثبة', type: 'road', lat: 24.1608, lng: 54.7473, len: 30, lenText: 'حوالي 30 كم اللفة الكاملة (خيارات 8، 16، 20، 22 كم). بعض المصادر تقول 40 كم', loops: ['8 كم', '16 كم', '20 كم', '30 كم'], gain: 40, surface: 'أسفلت وسط الكثبان', hours: 'مفتوح 24 ساعة', lit: 'unknown', fee: 'مجاني', fac: ['rental', 'parking'], authority: 'أبوظبي', rules: 'في الصيف اركب قبل الشروق أو بعد الغروب.', family: false, women: false, loop: true, src: ['https://www.dubizzle.com/blog/cars/cycle-tracks-abu-dhabi/', 'https://visitabudhabi.ae/en/where-to-go/sports-clubs/al-wathba-cycle-track'] },
  { id: 'al-ain-track', name: 'مسار العين للدراجات', en: 'Al Ain Cycling Track', emirate: 'أبوظبي', area: 'العين', type: 'road', lat: null, lng: null, len: 23, lenText: '23 كم مسار مستوي يناسب كل المستويات', loops: [], gain: 20, surface: 'أسفلت', hours: '', lit: 'unknown', fee: '', fac: [], authority: 'أبوظبي', family: true, src: ['https://gulfnews.com/lifestyle/where-to-ride-in-abu-dhabi-the-best-cycling-spots-in-and-around-the-city-1.500744549'] },
  { id: 'jebel-hafeet', name: 'صعود جبل حفيت', en: 'Jebel Hafeet climb', emirate: 'أبوظبي', area: 'العين – المبزّرة الخضراء', type: 'climb', lat: 24.1068, lng: 55.7402, len: 10.8, lenText: 'حوالي 10.5–11 كم صعود من المبزّرة الخضراء', loops: [], gain: 720, grad: 6.7, maxEl: 1040, surface: 'طريق أسفلت فيه سيارات (حارتين صعود وحارة نزول)', hours: 'طريق عام', lit: 'partial', fee: 'مجاني', fac: ['parking', 'cafe'], authority: 'طريق عام – أبوظبي', rules: 'ما فيه ظل. اطلع مع أول ضوء، وانتبه في النزول. أضواء أمامية وخلفية إلزامية.', family: false, women: false, loop: false, photo: 'hafit', src: ['https://pjammcycling.com/climb/1810.Jebel-Hafeet', 'https://climbfinder.com/en/climbs/jebel-hafeet'] },
  { id: 'jebel-jais', name: 'صعود جبل جيس', en: 'Jebel Jais climb', emirate: 'رأس الخيمة', area: 'جبل جيس', type: 'climb', lat: 25.9379, lng: 56.1308, isSummit: true, len: 20, lenText: 'أعلى طريق معبّد في الإمارات. الصعود الرئيسي 19–28 كم حسب نقطة البداية، والركبة الكاملة من الأسفل حوالي 36 كم', loops: [], gain: 1100, grad: 5.7, maxEl: 1490, surface: 'طريق أسفلت ممتاز فيه سيارات', hours: 'طريق عام', lit: 'partial', fee: 'مجاني', fac: ['cafe', 'parking', 'toilet'], authority: 'هيئة رأس الخيمة لتنمية السياحة (RAKTDA)', rules: 'الحرارة فوق أقل بحوالي 10 درجات، خذ جاكيت للنزول. النقطة على الخريطة هي منصة المشاهدة فوق.', family: false, women: false, loop: false, photo: 'jais', src: ['https://www.procyclingstats.com/climb/jebel-jais', 'https://pjammcycling.com/climb/1809.Jebel-Jais', 'https://visitrasalkhaimah.com/blog/cycling-routes-ras-al-khaimah/'] },
  { id: 'showka-mtb', name: 'مسارات شوكة للدراجات الجبلية', en: 'Showka MTB', emirate: 'رأس الخيمة', area: 'وادي الشوكة', type: 'mtb', lat: 25.0348, lng: 56.0211, len: 10, lenText: 'شبكة مسارات صخرية، مثلاً «Wadi Racer» بطول 10 كم ولفة السد للبرك حوالي 10 كم', loops: ['Wadi Racer 10 كم'], gain: 130, surface: 'صخري', hours: 'مفتوح', lit: 'none', fee: 'مجاني', fac: ['parking', 'rental'], authority: 'رأس الخيمة', rules: 'منطقة أودية: يتسكّر تلقائياً لما يكون في توقعات مطر. اتبع الـ GPS.', family: false, women: false, loop: false, photo: 'shawka', src: ['https://trailforks.com/trails/wadi-racer', 'https://www.dubizzle.com/blog/cars/shawka-mountain-bike-trail/'] },
  { id: 'masaar', name: 'مسار «مسار» للدراجات', en: 'Masaar Track', emirate: 'الشارقة', area: 'السيوح', type: 'circuit', lat: 25.2622, lng: 55.5923, len: 6.6, lenText: 'لفة احترافية متصلة 6.6 كم فيها 3 جسور و4 أنفاق', loops: ['6.6 كم'], gain: 25, surface: 'أسفلت', hours: '', lit: 'unknown', fee: '', fac: ['cafe', 'repair', 'rental', 'parking', 'toilet'], authority: 'أرادَ', rules: 'يتدرب فيه المنتخب الوطني للدراجات.', family: true, women: false, loop: true, src: ['https://www.arada.com/en/latest-news/arada-opens-masaar-track-an-exciting-new-cycling-facility-at-forested-sharjah-megaproject/', 'https://www.gulftoday.ae/sport/2026/04/09/uae-cycling-federation-and-arada-renew-masaar-track-partnership'] },
  { id: 'al-batayeh', name: 'مسار البطائح للدراجات', en: 'Al Batayeh Cycle Path', emirate: 'الشارقة', area: 'البطائح – مليحة', type: 'road', lat: 25.2042, lng: 55.6552, endLat: 25.0753, endLng: 55.8081, len: 24, lenText: '24 كم باتجاه واحد (48 كم ذهاب وعودة)، عرض 5 م، للدراجات بس', loops: ['24 كم', '48 كم'], gain: 60, surface: 'أسفلت', hours: '', lit: 'unknown', fee: 'مجاني', fac: ['toilet', 'prayer', 'parking'], authority: 'هيئة الطرق والمواصلات بالشارقة', rules: 'جاري بناء جسور سيارات لفصل المسار عن الطرق.', family: false, women: false, loop: false, src: ['https://sharjah24.ae/en/Articles/2023/01/18/Sheikh-Saud-bin-Sultan-inaugurates-Al-Batayeh-Cycle-Path', 'https://gulfnews.com/uae/sharjah-introduces-overpasses-to-boost-cyclist-safety-in-al-bataeh-1.500382191'] },
];

export const COMING = [
  { name: 'فيلودروم أبوظبي', en: 'Velodrome Abu Dhabi', note: 'جزيرة الحديريات: مضمار داخلي ولفة على السطح. متوقع ديسمبر 2026.', noteEn: 'Hudayriyat Island: indoor track plus rooftop loop, expected December 2026.' },
];

export const EMIRATES = ['دبي', 'أبوظبي', 'الشارقة', 'رأس الخيمة', 'الفجيرة', 'عجمان', 'أم القيوين'];
export const EMIRATE_EN = { 'دبي': 'Dubai', 'أبوظبي': 'Abu Dhabi', 'الشارقة': 'Sharjah', 'رأس الخيمة': 'Ras Al Khaimah', 'الفجيرة': 'Fujairah', 'عجمان': 'Ajman', 'أم القيوين': 'Umm Al Quwain' };

export const TYPES = {
  road: { ar: 'طريق', en: 'Road', c: '#FF5B14' },
  circuit: { ar: 'حلبة / لفات', en: 'Circuit', c: '#2F6FED' },
  mtb: { ar: 'جبلي MTB', en: 'MTB', c: '#18B26B' },
  climb: { ar: 'صعود', en: 'Climb', c: '#E5484D' },
  urban: { ar: 'مسار مدينة', en: 'Urban', c: '#9B5DE5' },
  park: { ar: 'حديقة', en: 'Park', c: '#0EA5A4' },
};

export const FAC = {
  rental: ['تأجير دراجات', 'Bike rental'], shower: ['شاور', 'Showers'], locker: ['خزائن', 'Lockers'], cafe: ['كافيه', 'Café'],
  water: ['ماي', 'Water refill'], parking: ['مواقف', 'Parking'], toilet: ['دورات مياه', 'Restrooms'], prayer: ['مصلى', 'Prayer area'],
  shade: ['مظلات', 'Shade'], repair: ['صيانة دراجات', 'Bike repair'], kids: ['للأطفال', 'Kids'],
};

// المقاطع: loop = ترجع لنقطة البداية بعد مسافة؛ summit = توصل القمة بعد صعود
export const SEGMENTS = [
  { id: 'jais-climb', track: 'jebel-jais', name: 'صعود جبل جيس', en: 'Jebel Jais climb', kind: 'summit', lat: 25.9379, lng: 56.1308, r: 300, minGain: 700, dist: 19 },
  { id: 'hafeet-climb', track: 'jebel-hafeet', name: 'صعود جبل حفيت', en: 'Jebel Hafeet climb', kind: 'summit', lat: 24.0600, lng: 55.7770, r: 450, minGain: 450, dist: 10.8 },
  { id: 'qudra-50', track: 'al-qudra', name: 'لفة القدرة 50 كم', en: 'Al Qudra 50 km loop', kind: 'loop', minDist: 45, r: 200, dist: 50 },
  { id: 'nas-8', track: 'nad-al-sheba', name: 'لفة ند الشبا 8 كم', en: 'Nad Al Sheba 8 km', kind: 'loop', minDist: 7.5, r: 150, dist: 8 },
  { id: 'yas-lap', track: 'yas-circuit', name: 'لفة حلبة ياس', en: 'Yas circuit lap', kind: 'loop', minDist: 5, r: 150, dist: 5.281 },
  { id: 'masaar-lap', track: 'masaar', name: 'لفة مسار 6.6 كم', en: 'Masaar 6.6 km lap', kind: 'loop', minDist: 6.2, r: 150, dist: 6.6 },
  { id: 'hud-10', track: 'hudayriyat', name: 'لفة الحديريات 10 كم', en: 'Hudayriyat 10 km', kind: 'loop', minDist: 9.5, r: 150, dist: 10 },
];

export const EMERGENCY = [
  { num: '999', ar: 'الشرطة', en: 'Police', hint: 'حادث أو خطر', hintEn: 'Crash or danger', urgent: true },
  { num: '998', ar: 'الإسعاف', en: 'Ambulance', hint: 'إصابة، إغماء، ضربة شمس', hintEn: 'Injury, fainting, heatstroke', urgent: true },
  { num: '997', ar: 'الدفاع المدني', en: 'Civil Defence', hint: 'حريق أو حادث خطر', hintEn: 'Fire or hazard', urgent: true },
  { num: '995', ar: 'البحث والإنقاذ', en: 'Search & Rescue', hint: 'المسارات الجبلية وMTB', hintEn: 'Mountain & MTB areas', urgent: false },
];

export const RULES = [
  { ar: 'الخوذة إلزامية.', en: 'A helmet is required.', src: 'https://www.khaleejtimes.com/uae/transport/uae-up-to-dh500-fine-for-electric-bike-bicycle-violations' },
  { ar: 'دبي: الخوذة والسترة العاكسة لازمة لراكبي الدراجات.', en: 'Dubai: helmet and reflective vest are required.', src: 'https://www.khaleejtimes.com/uae/transport/dubai-helmet-reflective-jacket-must-for-cyclists-e-scooter-riders?amp=1' },
  { ar: 'دبي: التدريب الجماعي لأكثر من 4 درّاجين يحتاج موافقة هيئة الطرق والمواصلات.', en: 'Dubai: group training with more than 4 riders needs RTA approval.', src: 'https://www.khaleejtimes.com/uae/transport/dubai-announces-new-rules-for-bicycles-e-scooters?amp=1' },
  { ar: 'دبي: غرامة 200 درهم للركوب بدون تصريح أو على الجهة اليسار، و300 درهم لعدم الإبلاغ عن حادث.', en: 'Dubai: AED 200 for riding without a permit or on the left; AED 300 for not reporting a crash.', src: 'https://www.khaleejtimes.com/life-and-living/dubai-rules-to-follow-to-avoid-dh300-fine-when-cycling-in-the-emirate' },
  { ar: 'أبوظبي: مخالفات توصل لـ500 درهم، منها الركوب على الطريق الرئيسي أو بدون خوذة. لا تلبس سماعات في الأذنين.', en: 'Abu Dhabi: fines up to AED 500, including riding on main roads or without a helmet. No earphones in both ears.', src: 'https://gulfnews.com/uae/watch-abu-dhabi-police-to-fine-riders-for-breaking-safety-rules-1.89927196' },
  { ar: 'أبوظبي: القروبات اللي تركب على طرق سرعتها فوق 80 كم/س تحتاج تصريح إلكتروني.', en: 'Abu Dhabi: groups riding on roads above 80 km/h need an electronic permit.', src: 'https://khaleejtimes.com/uae/abu-dhabi-how-cycling-became-a-part-of-the-capitals-culture?amp=1' },
  { ar: 'حامل الدراجات ورا السيارة يحتاج لوحة إضافية (غرامة 400 درهم).', en: 'A rear bike carrier needs an extra licence plate (AED 400 fine).', src: 'https://www.khaleejtimes.com/uae/transport/abu-dhabi-new-rules-and-regulations-for-e-bikes-and-bicycles' },
  { ar: 'الأضواء: أبيض قدّام وأحمر ورا.', en: 'Lights: white at the front, red at the back.', src: '' },
];

export const REPORT_TYPES = [
  { id: 'photo', ar: 'صورة من ركبتي', en: 'Ride photo', icon: 'camera', status: null },
  { id: 'closed', ar: 'مسكّر', en: 'Closed', icon: 'ban', status: 'closed' },
  { id: 'works', ar: 'صيانة أو أعمال', en: 'Works', icon: 'tool', status: 'maintenance' },
  { id: 'sand', ar: 'رمل على المسار', en: 'Sand on track', icon: 'wind', status: null },
  { id: 'light', ar: 'إنارة معطّلة', en: 'Lights out', icon: 'bulb', status: null },
  { id: 'cross', ar: 'تقاطع خطر', en: 'Dangerous crossing', icon: 'alert', status: null },
  { id: 'flood', ar: 'ماء أو سيول', en: 'Flooding', icon: 'wave', status: 'flood' },
  { id: 'open', ar: 'مفتوح وممتاز', en: 'Open & great', icon: 'check', status: 'open' },
  { id: 'suggestion', ar: 'اقتراح', en: 'Suggestion', icon: 'msg', status: null },
  { id: 'tip', ar: 'نصيحة', en: 'Tip', icon: 'bulb', status: null, hidden: true },
  { id: 'ride', ar: 'ركبة', en: 'Ride', icon: 'bike', status: null, hidden: true },
];

export const SEED_POSTS = [
  { id: 's1', team: true, author: 'فريق دوّاسة', trackId: 'al-qudra', type: 'tip', text: 'نصيحة الويكند: القدرة أحلى مع الشروق 🌅 حمّل ماي أكثر مما تتوقع، والمظلات تقريباً كل 10 كم. وخذ أضواء إذا بتطلع قبل الفجر.', hoursAgo: 4, photo: 'qudra', reacts: { fire: 18, clap: 24, heart: 11 } },
  { id: 's2', team: true, author: 'فريق دوّاسة', trackId: 'jebel-jais', type: 'tip', text: '⛰️ صعود جيس: الجو فوق أبرد بحوالي 10 درجات. خذ جاكيت خفيف للنزول وتأكد من الفرامل قبل لا تبدأ.', hoursAgo: 20, photo: 'jais', reacts: { fire: 40, clap: 15, heart: 22 } },
  { id: 's3', team: true, example: true, author: 'مثال: بلاغ من درّاج', trackId: 'al-qudra', type: 'sand', text: 'رمل على المسار بعد الكيلو 20. هذا مثال على شكل البلاغ لما الدرّاجين يبلّغون عن التراكات.', hoursAgo: 30, confirms: 2, reacts: { clap: 6 } },
  { id: 's4', team: true, author: 'فريق دوّاسة', trackId: 'yas-circuit', type: 'tip', text: '🏁 حلبة ياس: الجلسات مجانية بس لازم تسجّل أونلاين وتاخذ بطاقة العضوية. الجدول يتغير حول سباق الجائزة الكبرى.', hoursAgo: 50, photo: 'yas', reacts: { fire: 12, heart: 19 } },
];

// فعاليات أمثلة (توضيحية) – المستخدم يقدر يسوي فعالياته
export const SEED_EVENTS = [
  { id: 'e1', example: true, title: 'ركبة فجر في القدرة', trackId: 'al-qudra', dayOffset: 2, time: '05:30', pace: '25–28 كم/س', level: 'mid', distance: 50, max: 25, lights: true, women: false, organizer: 'فريق دوّاسة (مثال)', note: 'نلتقي عند مواقف البداية. خوذة وأضواء إلزامية.', joined: 11 },
  { id: 'e2', example: true, title: 'لفات ليلية في ند الشبا', trackId: 'nad-al-sheba', dayOffset: 4, time: '20:00', pace: 'سهل 18–22 كم/س', level: 'beginner', distance: 16, max: 30, lights: true, women: false, organizer: 'فريق دوّاسة (مثال)', note: 'مناسبة للمبتدئين. لفتين على مسار 8 كم.', joined: 7 },
  { id: 'e3', example: true, title: 'ركبة بنات في الحديريات', trackId: 'hudayriyat', dayOffset: 6, time: '06:30', pace: '20–24 كم/س', level: 'beginner', distance: 20, max: 20, lights: false, women: true, organizer: 'فريق دوّاسة (مثال)', note: 'للبنات فقط. نبدأ من نادي أبوظبي للدراجات.', joined: 9 },
];
