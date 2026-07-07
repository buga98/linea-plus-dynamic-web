export const defaultSettings = [{
  id: 'settings-main',
  brandName: 'Linea+',
  email: 'info@linea-plus.hr',
  phone: '+385 99 000 0000',
  location: 'Hrvatska / radimo lokalno i remote',
  heroEyebrow: 'Custom webovi i aplikacije bez kompromisa',
  heroLine1: 'Ne radimo samo web.',
  heroAccent: 'Gradimo razlog',
  heroLine3: 'da vas zapamte.',
  heroLead: 'Custom web stranice i aplikacije koje pretvaraju prvi pogled u ozbiljan poslovni dojam — i klik u stvaran upit.',
  aboutKicker: 'Vaš digitalni nastup ne smije izgledati kao još jedan u nizu.',
  aboutBefore: 'Dobar web objasni što radite.',
  aboutAccent: 'Brutalan web',
  aboutAfter: 'učini da ljudi požele raditi baš s vama.',
  aboutText: 'Linea+ spaja strategiju, dizajn i razvoj u jedno jasno iskustvo. Bez kupljenih tema, bez vizualne buke i bez “može proći”. Svaki detalj ima razlog — od prvog scrolla do zadnjeg poziva na akciju.',
  contactBefore: 'Imate ideju?',
  contactAccent: 'Napravimo da izgleda veliko.',
  contactText: 'Pošaljite nekoliko rečenica o projektu. Javljamo se s konkretnim smjerom, bez prodajnih magli.',
  instagram: '',
  linkedin: '',
  updatedAt: '2026-07-07T00:00:00.000Z'
}];

export const defaultMenu = [
  { id: 'menu-o-nama', label: 'O nama', href: '#o-nama', order: 1, published: true },
  { id: 'menu-rjesenja', label: 'Rješenja', href: '#usluge', order: 2, published: true },
  { id: 'menu-proces', label: 'Proces', href: '#proces', order: 3, published: true },
  { id: 'menu-portfolio', label: 'Portfolio', href: '#portfolio', order: 4, published: true },
  { id: 'menu-galerija', label: 'Galerija', href: '#galerija', order: 5, published: true },
  { id: 'menu-recenzije', label: 'Recenzije', href: '#recenzije', order: 6, published: true }
];

export const defaultServices = [
  {
    id: 'service-custom-web', number: '01', title: 'Custom web stranice',
    text: 'Prodajno usmjerene stranice s potpuno originalnim dizajnom, jasnom pričom i besprijekornim iskustvom na svakom uređaju.',
    tags: ['UX/UI', 'Scrollytelling', 'Mini CMS'], icon: '↗', order: 1, published: true
  },
  {
    id: 'service-web-app', number: '02', title: 'Web aplikacije',
    text: 'Portali, rezervacije, konfiguratori, korisničke zone i poslovni alati napravljeni točno prema vašem procesu.',
    tags: ['Custom logika', 'Firebase', 'API'], icon: '⌘', order: 2, published: true
  },
  {
    id: 'service-mobile-app', number: '03', title: 'Mobilne aplikacije',
    text: 'Brze i intuitivne aplikacije koje korisniku daju osjećaj da je sve upravo tamo gdje očekuje.',
    tags: ['iOS / Android', 'PWA', 'Prototip'], icon: '◫', order: 3, published: true
  },
  {
    id: 'service-redesign', number: '04', title: 'Redizajn i optimizacija',
    text: 'Postojeći proizvod pretvaramo u modernije, jasnije i brže iskustvo koje izgleda kao ozbiljan korak naprijed.',
    tags: ['Redizajn', 'Performance', 'SEO'], icon: '✦', order: 4, published: true
  }
];

export const defaultProcess = [
  { id: 'process-cilj', number: '01', title: 'Razumijemo cilj', text: 'Ne krećemo bojama nego pitanjima: tko kupuje, zašto kupuje i što mora osjetiti u prvih nekoliko sekundi.', order: 1, published: true },
  { id: 'process-smjer', number: '02', title: 'Gradimo smjer', text: 'Definiramo strukturu, poruke, vizualni koncept i korisnički put prije nego što se potroši vrijeme na pogrešne detalje.', order: 2, published: true },
  { id: 'process-dojam', number: '03', title: 'Dizajniramo dojam', text: 'Svaki ekran dobiva ritam, karakter i jasnoću. Dizajn nije ukras nego alat koji vodi prema akciji.', order: 3, published: true },
  { id: 'process-proizvod', number: '04', title: 'Razvijamo proizvod', text: 'Čist kod, fluidne animacije, mobilna preciznost i CMS koji vam omogućuje da sami upravljate sadržajem.', order: 4, published: true },
  { id: 'process-launch', number: '05', title: 'Lansiramo i pratimo', text: 'Testiramo, optimiziramo i puštamo projekt u rad bez drame. Nakon lansiranja ostajemo dostupni.', order: 5, published: true }
];

export const defaultProducts = [
  {
    id: 'meseco', title: 'MeseCo', type: 'Brand web + Mini CMS',
    description: 'Dinamička prezentacijska stranica za domaći brend, s upravljanjem sadržajem, galerijom, proizvodima, upitima i partnerima.',
    image: 'assets/project-mesaco.svg', color: '#ff633f', tags: ['Web', 'Mini CMS', 'Firebase'],
    stat: '100% dinamičan sadržaj', order: 1, published: true, featured: true
  },
  {
    id: 'flowdesk', title: 'FlowDesk', type: 'Poslovna web aplikacija',
    description: 'Operativni dashboard koji objedinjuje zadatke, klijente, dokumente i status projekta u jednom jasnom sustavu.',
    image: 'assets/project-flowdesk.svg', color: '#7668ff', tags: ['App', 'Dashboard', 'Firebase'],
    stat: 'Jedan sustav umjesto pet alata', order: 2, published: true, featured: true
  },
  {
    id: 'tablenow', title: 'TableNow', type: 'Rezervacijska platforma',
    description: 'Mobilno-first iskustvo rezervacije stola s pregledom termina, automatiziranim potvrdama i admin sučeljem.',
    image: 'assets/project-tablenow.svg', color: '#35c99a', tags: ['Booking', 'Mobile', 'Admin'],
    stat: 'Rezervacija u manje od 30 sekundi', order: 3, published: true, featured: true
  }
];

export const defaultGallery = [
  { id: 'gallery-meseco', title: 'Gastro brand', category: 'Web + Mini CMS', image: 'assets/project-mesaco.svg', order: 1, published: true },
  { id: 'gallery-flowdesk', title: 'SaaS dashboard', category: 'Web aplikacija', image: 'assets/project-flowdesk.svg', order: 2, published: true },
  { id: 'gallery-tablenow', title: 'Booking iskustvo', category: 'Mobile-first platforma', image: 'assets/project-tablenow.svg', order: 3, published: true }
];

export const defaultReviews = [
  { id: 'review-1', quote: 'Od prve prezentacije bilo nam je jasno da ne dobivamo samo web, nego potpuno novi način na koji nas klijenti doživljavaju.', name: 'Marko Horvat', role: 'Osnivač, MeseCo', rating: 5, order: 1, published: true },
  { id: 'review-2', quote: 'Kompleksan interni proces pretvoren je u aplikaciju koju je tim prihvatio bez posebne obuke. To nam je bio najveći dokaz kvalitete.', name: 'Ivana Babić', role: 'Operativna direktorica', rating: 5, order: 2, published: true },
  { id: 'review-3', quote: 'Brzina, komunikacija i detalji su na razini koju rijetko viđamo. Novi upiti počeli su dolaziti praktički odmah nakon lansiranja.', name: 'Luka Marić', role: 'Vlasnik restorana', rating: 5, order: 3, published: true }
];

export const DEFAULTS = {
  settings: defaultSettings,
  menu: defaultMenu,
  services: defaultServices,
  process: defaultProcess,
  products: defaultProducts,
  gallery: defaultGallery,
  reviews: defaultReviews,
  inquiries: []
};
