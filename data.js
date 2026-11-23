// Публичные демонстрационные данные интерфейса. Реальные контакты сотрудников в этом файле не хранятся.
// Подключается обычным <script src="data.js"> (работает и с file://), отдаёт window.NIKAMED.
// Реальные данные компании (юр. лицо, адрес головного офиса, телефоны) — с nikamed.ru.
// Остальные площадки (склад, шоурум, региональные офисы) — демо-значения: замените на актуальные адреса.
(() => {
  const photo = id => `https://images.unsplash.com/photo-${id}?w=640&h=640&fit=crop&crop=faces&auto=format&q=80`;

  const company = {
    name: 'Никамед',
    legalName: 'ООО «НИКАМЕД»',
    tagline: 'Крупнейший поставщик качественных ортопедических изделий и компрессионного трикотажа',
    positioning: 'B2B-эксперт: поставки ортопедических изделий для медицинских организаций, ортопедических салонов и аптечных сетей',
    site: 'https://www.nikamed.ru/',
    catalogUrl: 'https://www.nikamed.ru/catalogueproducts/',
    wholesalePhones: ['+7 (495) 609-63-33', '+7 (495) 609-63-86'], // дирекция по оптовым продажам
  };

  // Детерминированный генератор, чтобы цифры не прыгали между перезагрузками
  const rng = seed => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);

  // Площадки компании (ключ salons сохранён для совместимости с HTML: там это «место работы сотрудника»).
  // Города оставлены прежними: на них завязаны часовые пояса в card.html.
  const salons = [
    { id: 'msk-office',    name: 'Никамед Москва (офис)',    city: 'Москва',          address: 'Бумажный пр-д, 14, стр. 2', zip: '127015', hours: [9, 18] },
    { id: 'msk-warehouse', name: 'Никамед Москва (склад)',   city: 'Москва',          address: 'Кутузовский проспект, 24, склад А',     hours: [8, 19] },
    { id: 'msk-showroom',  name: 'Никамед Москва (шоурум)',  city: 'Москва',          address: 'Ходынский бульвар, 4, БЦ «Авиапарк»',   hours: [10, 19] },
    { id: 'spb-office',    name: 'Никамед Санкт-Петербург',  city: 'Санкт-Петербург', address: 'Невский проспект, 88',                  hours: [9, 18] },
    { id: 'ekb-office',    name: 'Никамед Екатеринбург',     city: 'Екатеринбург',    address: 'ул. Малышева, 5',                       hours: [9, 18] },
    { id: 'kzn-office',    name: 'Никамед Казань',           city: 'Казань',          address: 'ул. Баумана, 44',                       hours: [9, 18] },
  ];

  // ФИО на визитке: «Имя Отчество Фамилия». Храним три поля, name — готовая строка для показа.
  // splitName разбирает строку из демо-данных и старых записей: 2 слова — имя и фамилия, 3+ — с отчеством.
  const splitName = str => {
    const w = String(str || '').trim().split(/\s+/).filter(Boolean);
    if (w.length < 2) return { firstName: w[0] || '', middleName: '', lastName: '' };
    return { firstName: w[0], middleName: w.slice(1, -1).join(' '), lastName: w[w.length - 1] };
  };
  const fullName = p => [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ');
  const withName = e => {
    const parts = e.firstName || e.lastName ? { firstName: e.firstName || '', middleName: e.middleName || '', lastName: e.lastName || '' } : splitName(e.name);
    return { ...e, ...parts, name: fullName(parts) };
  };

  // Реальные сотрудники (staff: true) — данные из подписей писем. Рабочий телефон общий, у каждого свой добавочный.
  // WhatsApp и Telegram не указаны — плитки на визитке скрыты, включаются в админке.
  // Если такой сотрудник раньше был добавлен вручную в админке, та запись заменяется этой (см. «Замена» ниже).
  const OFFICE = '+7 (495) 609-63-86';
  // Реальные сотрудники загружаются только из Supabase employee_cards; в публичном JS контактов нет.
  const staff = [];

  // Демо-сотрудники (вымышленные). status: active | paused | draft
  // Реальные профили загружаются из Supabase; публичный JS не содержит персональных данных.
  const employees = [];

  // 30 дней сканирований, последний элемент — сегодня
  const r = rng(42);
  const scansDaily = Array.from({ length: 30 }, (_, d) => {
    const weekday = (d + 2) % 7; // 0 = понедельник
    return Math.round(520 * (weekday >= 5 ? 1.35 : 1) * (0.82 + r() * 0.36) * (1 + d * 0.006));
  });

  // Тепловая карта: 7 дней недели × 24 часа, пики в обед и вечером
  const heatmap = Array.from({ length: 7 }, (_, day) => Array.from({ length: 24 }, (_, h) => {
    if (h < 9 || h > 22) return Math.round(r() * 3);
    const peak = Math.exp(-((h - 13) ** 2) / 8) * 0.8 + Math.exp(-((h - 19) ** 2) / 6);
    return Math.round((18 + 70 * peak) * (day >= 5 ? 1.3 : 1) * (0.8 + r() * 0.4));
  }));

  // ---------- Визитки, созданные и изменённые в админке ----------
  // Локальное хранилище оставлено только для демонстрационных записей интерфейса. Реальные QR-карточки читаются из Supabase.
  // Browser storage must never be a source of employee records.
  // Clear the legacy cache on this browser and keep demo helpers memory-only.
  const LS_KEY = 'nikamed.cards.v1';
  try { localStorage.removeItem(LS_KEY); } catch {}
  const EDITABLE = ['firstName','middleName','lastName','role','salon','phone','whatsapp','telegram','workPhone','workExt','email','photo','experience','tags','status'];
  const baseIds = new Set(employees.map(e => e.id));
  const store = { upserts: {}, removed: [] };
  const normalize = u => withName({
    photo:null,status:'draft',scans:0,experience:0,tags:[],telegram:'',
    ...u,whatsapp:u.whatsapp ?? '',spark:Array(14).fill(0)
  });
  function persist() { return true; }
  function saveEmployee(e, at=0) {
    const rec = {id:e.id};
    EDITABLE.forEach(k => {if(e[k]!==undefined) rec[k]=e[k];});
    rec.name=fullName(rec);
    const i=employees.findIndex(x=>x.id===e.id);
    if(i>=0) Object.assign(employees[i],withName(rec));
    else employees.splice(Math.max(0,Math.min(at,employees.length)),0,{...normalize(rec),...(e.spark?{scans:e.scans,spark:e.spark}:{})});
    return true;
  }
  function removeEmployee(id) {
    const i=employees.findIndex(e=>e.id===id);
    if(i>=0) employees.splice(i,1);
    return true;
  }
  const isIdFree = id => !baseIds.has(id) && !employees.some(e=>e.id===id);
  const hasLocalChanges = () => false;
  function resetLocal() { try { localStorage.removeItem(LS_KEY); } catch {} }

  const NIKAMED = {
    company,
    salons,
    employees,
    salon: id => salons.find(s => s.id === id),
    employee: id => employees.find(e => e.id === id),
    saveEmployee, removeEmployee, isIdFree, hasLocalChanges, resetLocal, fullName, splitName,
    isCustom: id => !baseIds.has(id),

    admin: { name: 'Мария Гончарова', role: 'Руководитель HR', photo: photo('1573496359142-b8d87734a5a2') },

    stats: {
      paperSaved: 45000,       // листов бумаги (отказ от печатных визиток)
      activeQr: 1240,
      scansMonth: scansDaily.reduce((a, b) => a + b, 0), scansDelta: 12.4, // % к прошлому месяцу
      bookings: 612, bookingsDelta: 8.1,    // запросов на встречу и консультацию с визиток
      contactsSaved: 4870,                  // скачиваний vCard
    },
    scansDaily,
    channels: [ // доля сканирований по каналам
      { key: 'qr', label: 'QR-код', share: 0.62 },
      { key: 'nfc', label: 'NFC-метка', share: 0.23 },
      { key: 'link', label: 'Ссылка', share: 0.15 },
    ],
    heatmap,

    // ESG: оценки на основе средних отраслевых коэффициентов
    esg: {
      paperSheets: 45000,
      goalSheets: 60000,         // цель на 2026 год
      co2Kg: 225,                // ~5 г CO₂e на лист A4
      trees: 5.4,                // ~8 300 листов на дерево
      waterLiters: 450000,       // ~10 л воды на лист
      monthly: [1800, 2100, 2600, 3100, 3500, 3900, 4300, 4700, 5200, 5600, 6000, 7200], // окт 2025 → сен 2026
    },

    notifications: [
      { icon: 'qr-code',          text: 'Ольга Николаевна Морозова выпустила 25 QR-кодов для шоурума «Никамед Москва»', time: '5 мин назад', unread: true },
      { icon: 'trending-up',      text: 'Всплеск сканирований: «Санкт-Петербург» +38% за сутки',              time: '1 ч назад',   unread: true },
      { icon: 'user-round-check', text: 'Профиль Дарьи Дмитриевны Поповой ждёт модерации',                              time: '3 ч назад',   unread: true },
      { icon: 'leaf',             text: 'ESG-отчёт за сентябрь готов к выгрузке',                            time: 'вчера',       unread: false },
    ],
  };

  window.NIKAMED = NIKAMED;
})();
