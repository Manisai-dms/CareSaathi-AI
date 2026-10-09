export type Language = 'en' | 'te' | 'hi';

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    appName: "CareSaathi AI",
    tagline: "Healthcare Cost & Care Navigator",
    navHome: "Home",
    navDashboard: "Dashboard",
    navEstimate: "Estimate Cost",
    navFindHospitals: "Find Hospitals",
    navFinancialSupport: "Financial Support",
    navHowItWorks: "How It Works",
    startSearch: "Start Healthcare Search",

    // Hero
    heroHeadline: "Know the Cost. Find the Care. Discover the Support.",
    heroSubtitle: "CareSaathi AI helps you explore treatment cost estimates, nearby healthcare facilities, and potentially applicable financial support in one place.",
    exploreOptions: "Explore Healthcare Options",
    howItWorksBtn: "How It Works",

    // Features
    featCostTitle: "Cost Estimation",
    featCostDesc: "Explore indicative treatment and diagnostic price ranges with transparent breakdowns.",
    featHospTitle: "Nearby Care Discovery",
    featHospDesc: "Find verified facilities that match treatment requirements, location, and ownership tiers.",
    featSchemeTitle: "Scheme & Insurance Navigator",
    featSchemeDesc: "Explore potentially applicable financial support including PM-JAY, Aarogyasri, and CGHS.",

    // Steps
    step1Title: "1. Tell us what care you need",
    step1Desc: "Type in plain words, use voice speech, or upload a prescription image.",
    step2Title: "2. Compare costs and nearby facilities",
    step2Desc: "See transparent price ranges, confidence levels, and verified hospital capabilities.",
    step3Title: "3. Explore financial support",
    step3Desc: "Check eligible government health schemes and verified empanelled providers.",

    // Search bar
    searchPlaceholder: "e.g. 'I need a knee replacement in Hyderabad' or 'MRI scan in Kukatpally'...",
    searchBtn: "Search Care",
    voiceBtn: "Voice Search",
    rxBtn: "Upload Prescription",
    searching: "Analyzing with Healthcare AI...",

    // Results & Cards
    indicativeRange: "Indicative Price Range",
    priceType: "Price Type",
    confidence: "Confidence Level",
    viewBreakdown: "View Cost Breakdown",
    verifiedHospital: "Verified Facility",
    directions: "Directions",
    callFacility: "Call Facility",
    compare: "Compare",
    removeCompare: "Remove",

    // Schemes
    potentiallyApplicable: "Potentially Applicable",
    moreInfoRequired: "More Information Required",
    coverageNotVerified: "Coverage Not Verified",
    notMatching: "Criteria Not Matched",
    officialVerificationReq: "Official Verification Required",
    checkEligibility: "Check My Eligibility",

    // Disclaimer
    disclaimerNotice: "CareSaathi AI is an informational cost directory, not a medical diagnosis system or hospital billing desk. All estimates and scheme statuses require official facility confirmation."
  },

  te: {
    // Nav
    appName: "కేర్ సాథీ AI",
    tagline: "వైద్య ఖర్చులు & సంరక్షణ నావిగేటర్",
    navHome: "హోమ్",
    navDashboard: "డాష్‌బోర్డ్",
    navEstimate: "ఖర్చు అంచనా",
    navFindHospitals: "ఆసుపత్రులు కనుగొనండి",
    navFinancialSupport: "ఆర్థిక సహాయం (పథకాలు)",
    navHowItWorks: "ఇది ఎలా పనిచేస్తుంది",
    startSearch: "వెతకడం ప్రారంభించండి",

    // Hero
    heroHeadline: "ఖర్చు తెలుసుకోండి. వైద్యాన్ని కనుగొనండి. సహాయం పొందండి.",
    heroSubtitle: "కేర్ సాథీ AI ద్వారా చికిత్స ఖర్చుల అంచనాలు, సమీపంలోని ఆసుపత్రులు మరియు ప్రభుత్వ ఆరోగ్య పథకాల మద్దతును ఒకే చోట సులభంగా తెలుసుకోండి.",
    exploreOptions: "చికిత్స ఎంపికలను చూడండి",
    howItWorksBtn: "ఇది ఎలా పనిచేస్తుంది",

    // Features
    featCostTitle: "చికిత్స ఖర్చు అంచనా",
    featCostDesc: "చికిత్సలు మరియు డయాగ్నోస్టిక్స్ కోసం సుమారు ధరల వివరాలను పారదర్శకంగా పరిశీలించండి.",
    featHospTitle: "సమీప ఆసుపత్రుల శోధన",
    featHospDesc: "మీ చికిత్స అవసరాలు, స్థానం మరియు ప్రభుత్వ/ప్రైవేట్ కేటగిరీకి తగిన ఆసుపత్రులను కనుగొనండి.",
    featSchemeTitle: "ఆరోగ్యశ్రీ & బీమా మార్గదర్శి",
    featSchemeDesc: "ఆరోగ్యశ్రీ, ఆయుష్మాన్ భారత్ (PM-JAY), CGHS వంటి వర్తించే ప్రభుత్వ పథకాలను పరిశీలించండి.",

    // Steps
    step1Title: "1. మీకు కావాల్సిన చికిత్సను చెప్పండి",
    step1Desc: "సాధారణ మాటల్లో టైప్ చేయండి, మైక్ ద్వారా మాట్లాడండి లేదా ప్రిస్క్రిప్షన్ అప్‌లోడ్ చేయండి.",
    step2Title: "2. ఖర్చులు & ఆసుపత్రులను పోల్చండి",
    step2Desc: "స్పష్టమైన ధర పరిధులు, నమ్మక స్థాయిలు మరియు ధృవీకరించబడిన ఆసుపత్రుల సామర్థ్యాలను చూడండి.",
    step3Title: "3. ప్రభుత్వ ఆర్థిక సహాయాన్ని పరిశీలించండి",
    step3Desc: "మీకు వర్తించే ఆరోగ్య పథకాలను మరియు ఎంప్యానెల్ చేయబడిన ఆసుపత్రులను ధృవీకరించుకోండి.",

    // Search bar
    searchPlaceholder: "ఉదా: 'హైదరాబాద్‌లో మోకాలి మార్పిడి శస్త్రచికిత్స' లేదా 'కూకట్‌పల్లిలో ఎంఆర్ఐ స్కాన్'...",
    searchBtn: "శోధించండి",
    voiceBtn: "వాయిస్ శోధన",
    rxBtn: "ప్రిస్క్రిప్షన్ అప్‌లోడ్",
    searching: "విశ్లేషిస్తోంది...",

    // Results & Cards
    indicativeRange: "సుమారు ధరల పరిధి",
    priceType: "ధర రకం",
    confidence: "విశ్వసనీయత స్థాయి",
    viewBreakdown: "ఖర్చుల వివరాలు చూడండి",
    verifiedHospital: "ధృవీకరించబడిన ఆసుపత్రి",
    directions: "దారి (మ్యాప్)",
    callFacility: "కాల్ చేయండి",
    compare: "పోల్చండి",
    removeCompare: "తొలగించు",

    // Schemes
    potentiallyApplicable: "వర్తించే అవకాశం ఉంది",
    moreInfoRequired: "మరింత సమాచారం అవసరం",
    coverageNotVerified: "కవరేజ్ ధృవీకరించబడలేదు",
    notMatching: "నియమాలు సరిపోలలేదు",
    officialVerificationReq: "అధికారిక ధృవీకరణ అవసరం",
    checkEligibility: "అర్హతను తనిఖీ చేయండి",

    // Disclaimer
    disclaimerNotice: "కేర్ సాథీ AI ఒక సమాచార మార్గదర్శి మాత్రమే. ఇది వైద్య నిర్ధారణ లేదా అంతిమ ఆసుపత్రి కొటేషన్ కాదు. దయచేసి ఆసుపత్రి కౌంటర్‌లో నేరుగా ధృవీకరించుకోండి."
  },

  hi: {
    // Nav
    appName: "केयरसाथी AI",
    tagline: "स्वास्थ्य सेवा लागत एवं अस्पताल नेविगेटर",
    navHome: "होम",
    navDashboard: "डैशबोर्ड",
    navEstimate: "लागत अनुमान",
    navFindHospitals: "अस्पताल खोजें",
    navFinancialSupport: "सरकारी योजनाएं व सहायता",
    navHowItWorks: "यह कैसे काम करता है",
    startSearch: "सर्च शुरू करें",

    // Hero
    heroHeadline: "लागत जानें। उपचार खोजें। सरकारी सहायता पाएं।",
    heroSubtitle: "केयरसाथी AI उपचार लागत का अनुमान, नजदीकी अस्पताल और आयुष्मान भारत व राज्य स्वास्थ्य योजनाओं की जानकारी एक ही स्थान पर प्रदान करता है।",
    exploreOptions: "उपचार विकल्प देखें",
    howItWorksBtn: "यह कैसे काम करता है",

    // Features
    featCostTitle: "उपचार लागत का अनुमान",
    featCostDesc: "विभिन्न सर्जरी और जांचों के लिए पारदर्शी अनुमानित मूल्य और खर्चों का विवरण देखें।",
    featHospTitle: "नजदीकी अस्पताल खोजें",
    featHospDesc: "अपनी आवश्यकता, स्थान और सरकारी/निजी श्रेणी के अनुसार उपयुक्त स्वास्थ्य केंद्र खोजें।",
    featSchemeTitle: "योजना एवं बीमा सहायता",
    featSchemeDesc: "आयुष्मान भारत (PM-JAY), आरोग्यश्री और CGHS जैसी लाभकारी योजनाओं की पात्रता जांचें।",

    // Steps
    step1Title: "1. बताएं कि आपको किस उपचार की आवश्यकता है",
    step1Desc: "सामान्य शब्दों में लिखें, आवाज (माइक) से बोलें या पर्ची (प्रिस्क्रिप्शन) अपलोड करें।",
    step2Title: "2. खर्च और अस्पतालों की तुलना करें",
    step2Desc: "लागत का दायरा, विश्वसनीयता स्तर और अस्पताल की सुविधाओं का अवलोकन करें।",
    step3Title: "3. वित्तीय सहायता एवं सरकारी योजनाएं खोजें",
    step3Desc: "उपलब्ध योजनाओं और पैनल में शामिल सूचीबद्ध अस्पतालों की पुष्टि करें।",

    // Search bar
    searchPlaceholder: "उदा: 'हैदराबाद में घुटने का प्रत्यारोपण' या 'कुकटपल्ली में एमआरआई जांच'...",
    searchBtn: "सर्च करें",
    voiceBtn: "वॉइस सर्च",
    rxBtn: "पर्ची अपलोड करें",
    searching: "विश्लेषण किया जा रहा है...",

    // Results & Cards
    indicativeRange: "अनुमानित खर्च सीमा",
    priceType: "मूल्य प्रकार",
    confidence: "विश्वसनीयता स्तर",
    viewBreakdown: "खर्च का पूरा विवरण देखें",
    verifiedHospital: "सत्यापित अस्पताल",
    directions: "रास्ता देखें",
    callFacility: "कॉल करें",
    compare: "तुलना करें",
    removeCompare: "हटाएं",

    // Schemes
    potentiallyApplicable: "लागू होने की संभावना है",
    moreInfoRequired: "अधिक जानकारी आवश्यक",
    coverageNotVerified: "कवरेज सत्यापित नहीं है",
    notMatching: "मापदंड मेल नहीं खाते",
    officialVerificationReq: "आधिकारिक सत्यापन आवश्यक",
    checkEligibility: "अपनी पात्रता जांचें",

    // Disclaimer
    disclaimerNotice: "केयरसाथी AI केवल एक सूचनात्मक स्वास्थ्य निर्देशिका है, यह कोई मेडिकल निदान या अंतिम बिल नहीं है। कृपया अस्पताल से अंतिम दर की पुष्टि अवश्य करें।"
  }
};
