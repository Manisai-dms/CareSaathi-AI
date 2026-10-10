export interface GalleryThumbnail {
  id: string;
  stageName: string;
  caption: string;
  image: string;
  altText: string;
}

export interface ConditionVisual {
  id: string;
  name: string;
  department: string;
  heroImage: string;
  heroAlt: string;
  gallery: GalleryThumbnail[];
  description: string;
  avgDuration: string;
  hospitalStay: string;
  keyHighlights: string[];
  departmentIcon: string; // Used for fallback badge
}

export const CONDITION_VISUALS: ConditionVisual[] = [
  {
    id: 'cataract_surgery',
    name: 'Cataract Eye Surgery',
    department: 'Ophthalmology',
    heroImage: '/images/conditions/cataract_surgery/hero.png',
    heroAlt: 'Medical illustration of cataract eye lens replacement with clear intraocular lens',
    gallery: [
      {
        id: 'cataract-1',
        stageName: 'Pre-Op Evaluation',
        caption: 'Detailed biometry and eye power assessment for custom intraocular lens selection.',
        image: '/images/conditions/cataract_surgery/1.png',
        altText: 'Biometry and lens measurement stage for cataract surgery'
      },
      {
        id: 'cataract-2',
        stageName: 'Phacoemulsification',
        caption: 'Gentle ultrasound or laser dissolves the cloudy lens followed by foldable IOL placement.',
        image: '/images/conditions/cataract_surgery/hero.png',
        altText: 'Foldable lens insertion during cataract procedure'
      },
      {
        id: 'cataract-3',
        stageName: 'Recovery & Vision Clarity',
        caption: 'Protective shield worn overnight; normal clear vision typically stabilizes in 24-48 hours.',
        image: '/images/conditions/cataract_surgery/2.png',
        altText: 'Post-operative recovery eye care instructions'
      }
    ],
    description: 'A quick, painless daycare procedure to replace your clouded natural eye lens with a premium artificial lens (IOL), restoring clear, vibrant vision without stitches.',
    avgDuration: '15 – 30 minutes',
    hospitalStay: 'Daycare (Discharge in 2 – 3 hours)',
    keyHighlights: ['Painless topical drop anesthesia', 'No stitches required', 'Normal activities resume in 48 hours'],
    departmentIcon: 'Eye'
  },
  {
    id: 'knee_replacement',
    name: 'Total Knee Replacement (TKR)',
    department: 'Orthopedics',
    heroImage: '/images/conditions/knee_replacement/hero.png',
    heroAlt: 'Medical illustration of total knee replacement prosthetic implant and joint alignment',
    gallery: [
      {
        id: 'tkr-1',
        stageName: 'Joint Assessment & Prep',
        caption: 'Digital weight-bearing X-rays map exact articular cartilage wear and implant sizing.',
        image: '/images/conditions/knee_replacement/1.png',
        altText: 'Orthopedic joint evaluation and planning'
      },
      {
        id: 'tkr-2',
        stageName: 'Precision Resurfacing',
        caption: 'Damaged bone ends are resurfaced with medical-grade titanium and high-durability polymer.',
        image: '/images/conditions/knee_replacement/hero.png',
        altText: 'Prosthetic knee joint implant placement diagram'
      },
      {
        id: 'tkr-3',
        stageName: 'Mobility Rehab',
        caption: 'Assisted walking begins on day 1 with progressive physical therapy to regain complete mobility.',
        image: '/images/conditions/knee_replacement/2.png',
        altText: 'Post-op knee physiotherapy and walking rehabilitation'
      }
    ],
    description: 'Resurfaces arthritic knee joints with medical-grade metal and durable polymer spacers to eliminate chronic joint pain and restore pain-free walking.',
    avgDuration: '60 – 90 minutes',
    hospitalStay: '2 – 4 days in hospital',
    keyHighlights: ['Supported walking begins within 24 hours', 'Long-lasting implants (20+ years)', 'Comprehensive pain-relief therapy'],
    departmentIcon: 'Activity'
  },
  {
    id: 'diabetes_care',
    name: 'Diabetes Care & HbA1c Management',
    department: 'General Medicine / Endocrinology',
    heroImage: '/images/conditions/diabetes_care/hero.png',
    heroAlt: 'Medical illustration of diabetes blood glucose monitoring HbA1c testing and endocrine care',
    gallery: [
      {
        id: 'diab-1',
        stageName: 'HbA1c & Metabolic Profiling',
        caption: 'Three-month average blood glucose testing, fasting insulin levels, and kidney microalbumin check.',
        image: '/images/conditions/diabetes_care/1.png',
        altText: 'Blood glucose and HbA1c metabolic diagnostic profile'
      },
      {
        id: 'diab-2',
        stageName: 'Insulin & Oral Regimen',
        caption: 'Personalized modern oral antidiabetic therapy and insulin titration targeted to your lifestyle.',
        image: '/images/conditions/diabetes_care/hero.png',
        altText: 'Targeted diabetes medication and glucose management therapy'
      },
      {
        id: 'diab-3',
        stageName: 'Preventive Organ Screening',
        caption: 'Periodic diabetic eye fundus, peripheral neuropathy foot checks, and cardiac risk control.',
        image: '/images/conditions/diabetes_care/2.png',
        altText: 'Diabetic organ protection and lifestyle coaching'
      }
    ],
    description: 'Comprehensive endocrine evaluation and metabolic stabilization to keep 3-month blood sugars (HbA1c) in target, shielding kidneys, nerves, and heart from complications.',
    avgDuration: 'OPD Consultation + 24hr Lab Panel',
    hospitalStay: 'Outpatient (No hospital stay needed)',
    keyHighlights: ['Prevents microvascular organ damage', 'Personalized dietary & insulin planning', 'Regular continuous glucose tracking'],
    departmentIcon: 'HeartPulse'
  },
  {
    id: 'kidney_stones',
    name: 'Laser Lithotripsy (Kidney Stones)',
    department: 'Urology',
    heroImage: '/images/conditions/kidney_stones/hero.png',
    heroAlt: 'Medical illustration of laser lithotripsy breaking urinary kidney stones with soundwaves',
    gallery: [
      {
        id: 'stone-1',
        stageName: 'CT Urogram Mapping',
        caption: 'Non-contrast 3D CT scan locates stone coordinates, density (Hounsfield units), and size.',
        image: '/images/conditions/kidney_stones/1.png',
        altText: 'Diagnostic imaging of renal calculi'
      },
      {
        id: 'stone-2',
        stageName: 'Holmium Laser Dusting',
        caption: 'Flexible ureteroscope delivers laser pulses to pulverize hard stones into fine dust.',
        image: '/images/conditions/kidney_stones/hero.png',
        altText: 'Laser fiber breaking urinary calculus'
      },
      {
        id: 'stone-3',
        stageName: 'Stent & Natural Clearance',
        caption: 'Temporary soft DJ stent ensures unobstructed urine passage with rapid relief.',
        image: '/images/conditions/kidney_stones/2.png',
        altText: 'Renal clearance and post-lithotripsy recovery'
      }
    ],
    description: 'A minimally invasive endoscopic procedure utilizing microscopic laser fibers to vaporize kidney or ureteric stones into fine dust without external skin incisions.',
    avgDuration: '30 – 60 minutes',
    hospitalStay: 'Daycare or 1 day observation',
    keyHighlights: ['100% incision-free through natural tract', 'Immediate relief from severe flank pain', 'Same-day or next-morning discharge'],
    departmentIcon: 'Zap'
  },
  {
    id: 'mri_brain',
    name: 'MRI Scan (Brain / Spine)',
    department: 'Radiology & Diagnostics',
    heroImage: '/images/conditions/mri_brain/hero.png',
    heroAlt: 'Medical illustration of brain cross section and magnetic resonance imaging scanner',
    gallery: [
      {
        id: 'mri-1',
        stageName: 'Screening & Preparation',
        caption: 'Safety checklist confirms absence of ferromagnetic implants, cardiac pacemakers, or loose metal.',
        image: '/images/conditions/mri_brain/1.png',
        altText: 'Patient safety screening for MRI imaging'
      },
      {
        id: 'mri-2',
        stageName: 'Multi-Sequence Acquisition',
        caption: 'High-tesla magnetic field captures sub-millimeter axial, sagittal, and coronal neurological slices.',
        image: '/images/conditions/mri_brain/hero.png',
        altText: 'MRI scanner gantry and neurological imaging acquisition'
      },
      {
        id: 'mri-3',
        stageName: 'Radiologist Diagnostic Review',
        caption: 'Board-certified radiologist reviews contrast uptake and compiles high-definition report.',
        image: '/images/conditions/mri_brain/2.png',
        altText: 'Radiology diagnostic report and brain image slices'
      }
    ],
    description: 'Zero-radiation advanced magnetic resonance imaging that produces microscopic-detail 3D cross-sections of neural structures, brain tissue, spine, and vascular networks.',
    avgDuration: '20 – 45 minutes',
    hospitalStay: 'Outpatient diagnostic (No hospital stay)',
    keyHighlights: ['Zero ionizing radiation exposure', 'Exceptional soft-tissue anatomical detail', 'Digital reports available within hours'],
    departmentIcon: 'Scan'
  },
  {
    id: 'blood_tests',
    name: 'Comprehensive Blood Test Panel',
    department: 'Pathology & Diagnostics',
    heroImage: '/images/conditions/blood_tests/hero.png',
    heroAlt: 'Medical illustration of diagnostic laboratory blood test tubes centrifuge and clinical health report',
    gallery: [
      {
        id: 'blood-1',
        stageName: 'Sterile Phlebotomy',
        caption: 'Fast, gentle single-prick vacuum blood collection in barcoded EDTA and gel serum tubes.',
        image: '/images/conditions/blood_tests/1.png',
        altText: 'Safe blood sample phlebotomy collection'
      },
      {
        id: 'blood-2',
        stageName: 'Automated Analyzer Profiling',
        caption: 'Calibrated biochemistry analyzers test Complete Hemogram, Liver (LFT), Kidney (KFT), and Lipid metrics.',
        image: '/images/conditions/blood_tests/hero.png',
        altText: 'Biochemistry laboratory analyzers and centrifuge testing'
      },
      {
        id: 'blood-3',
        stageName: 'Verified Clinical Report',
        caption: 'NABL-accredited diagnostic report with color-coded normal/abnormal reference biomarker bands.',
        image: '/images/conditions/blood_tests/2.png',
        altText: 'Accredited pathology diagnostic biomarker report'
      }
    ],
    description: 'An all-inclusive screening panel covering Complete Blood Count (CBC), Liver Function, Kidney Function, Lipid Profile, Thyroid, and fasting blood sugars for total wellness check.',
    avgDuration: '5 – 10 minutes sample collection',
    hospitalStay: 'Outpatient / Home sample pickup',
    keyHighlights: ['60+ vital health parameters measured', 'NABL accredited automated analyzers', 'Smart digital color-coded report within 12h'],
    departmentIcon: 'Droplet'
  },
  {
    id: 'normal_delivery',
    name: 'Normal Delivery & Maternity Care',
    department: 'Obstetrics',
    heroImage: '/images/conditions/normal_delivery/hero.png',
    heroAlt: 'Medical illustration of newborn infant mother and obstetric maternity doctor clinic care',
    gallery: [
      {
        id: 'mat-1',
        stageName: 'Labor Comfort & Monitoring',
        caption: 'Continuous fetal heart rate tracing (CTG) and supportive birth positions in private LDR suites.',
        image: '/images/conditions/normal_delivery/1.png',
        altText: 'Obstetric monitoring and maternal comfort suite'
      },
      {
        id: 'mat-2',
        stageName: 'Safe Natural Birth',
        caption: 'Skilled obstetrician and neonatology team support gentle vaginal delivery with partner support.',
        image: '/images/conditions/normal_delivery/hero.png',
        altText: 'Maternal and newborn doctor care during delivery'
      },
      {
        id: 'mat-3',
        stageName: 'Postnatal Bonding & Lactation',
        caption: 'Immediate skin-to-skin newborn kangaroo care and certified lactation consultant guidance.',
        image: '/images/conditions/normal_delivery/2.png',
        altText: 'Postpartum mother and newborn wellness'
      }
    ],
    description: 'Gentle, natural vaginal childbirth guided by compassionate obstetric teams, featuring continuous fetal monitoring, pain relief options, and immediate mother-infant bonding.',
    avgDuration: '6 – 14 hours active labor',
    hospitalStay: '1 – 2 days in maternity suite',
    keyHighlights: ['Immediate golden hour skin-to-skin bonding', 'Dedicated lactation and newborn pediatric support', 'Natural pain relief and epidural choices'],
    departmentIcon: 'Heart'
  },
  {
    id: 'c_section',
    name: 'Caesarean Section (C-Section)',
    department: 'Obstetrics & Gynecology',
    heroImage: '/images/conditions/c_section/hero.png',
    heroAlt: 'Medical illustration of maternity hospital nursery infant crib and obstetric ultrasound equipment',
    gallery: [
      {
        id: 'cs-1',
        stageName: 'Pre-Op Ultrasound & Regional Anesthesia',
        caption: 'Final biophysical score check, sterile drape preparation, and regional spinal anesthesia.',
        image: '/images/conditions/c_section/1.png',
        altText: 'Obstetric ultrasound and surgical preparation'
      },
      {
        id: 'cs-2',
        stageName: 'Safe Surgical Delivery',
        caption: 'Gentle low-transverse uterine incision ensures infant delivery within 10-15 minutes of incision.',
        image: '/images/conditions/c_section/hero.png',
        altText: 'Surgical delivery and newborn safety assessment'
      },
      {
        id: 'cs-3',
        stageName: 'Maternity Nursery & Mother Recovery',
        caption: 'Dedicated pediatric warmer evaluation, pain pump management, and assisted mobilization in 12 hours.',
        image: '/images/conditions/c_section/2.png',
        altText: 'Postoperative recovery and nursery infant care'
      }
    ],
    description: 'A planned or emergent surgical birth through a low-transverse abdominal incision, prioritized when vaginal birth poses safety considerations for the mother or baby.',
    avgDuration: '40 – 50 minutes',
    hospitalStay: '3 – 4 days in hospital',
    keyHighlights: ['Low transverse cosmetic bikini-line incision', 'Continuous pediatrician resuscitation standby', 'Early mother-infant bonding in recovery room'],
    departmentIcon: 'Baby'
  },
  {
    id: 'cardiac_angioplasty',
    name: 'Coronary Angioplasty (PTCA)',
    department: 'Cardiology',
    heroImage: '/images/conditions/cardiac_angioplasty/hero.png',
    heroAlt: 'Medical illustration of coronary angioplasty heart blood vessel catheter and stent expansion',
    gallery: [
      {
        id: 'ptca-1',
        stageName: 'Diagnostic Coronary Angiogram',
        caption: 'Wrist (radial artery) access fluoroscopy spots exact percent blockage in coronary arteries.',
        image: '/images/conditions/cardiac_angioplasty/1.png',
        altText: 'Coronary angiogram arterial roadmap'
      },
      {
        id: 'ptca-2',
        stageName: 'Drug-Eluting Stent (DES) Expansion',
        caption: 'Micro-balloon expands inside the artery and embeds a drug-eluting stent to permanently restore bloodflow.',
        image: '/images/conditions/cardiac_angioplasty/hero.png',
        altText: 'Drug-eluting stent deployment in coronary vessel'
      },
      {
        id: 'ptca-3',
        stageName: 'Cardiac Care Unit (CCU) Recovery',
        caption: 'Wrist closure band removed in 4 hours; monitored telemetry ensures cardiac stability before discharge.',
        image: '/images/conditions/cardiac_angioplasty/2.png',
        altText: 'Post-angioplasty telemetry recovery'
      }
    ],
    description: 'A life-saving minimally invasive catheter technique that opens blocked heart arteries using tiny balloon inflations and permanently implants drug-eluting stents (DES).',
    avgDuration: '30 – 60 minutes',
    hospitalStay: '1 – 2 days (often discharged next day)',
    keyHighlights: ['Incision-free wrist (transradial) access', 'Immediate restoration of heart muscle perfusion', 'Prevents future myocardial infarction events'],
    departmentIcon: 'ShieldAlert'
  },
  {
    id: 'laparoscopic_cholecystectomy',
    name: 'Gallbladder Removal (Laparoscopic)',
    department: 'General Surgery',
    heroImage: '/images/conditions/laparoscopic_cholecystectomy/hero.png',
    heroAlt: 'Medical illustration of laparoscopic gallbladder anatomy minimally invasive laparoscope camera concept',
    gallery: [
      {
        id: 'lap-1',
        stageName: 'Abdominal Ultrasound & Prep',
        caption: 'High-resolution sonography confirms gallstones or cholecystitis with bile duct anatomy check.',
        image: '/images/conditions/laparoscopic_cholecystectomy/1.png',
        altText: 'Ultrasound verification of gallstones and gallbladder inflammation'
      },
      {
        id: 'lap-2',
        stageName: 'Keyhole Laparoscopic Removal',
        caption: '4 micro-incisions (5-10mm) allow high-definition camera and instruments to cleanly detach gallbladder.',
        image: '/images/conditions/laparoscopic_cholecystectomy/hero.png',
        altText: 'Minimally invasive keyhole laparoscopic surgical removal'
      },
      {
        id: 'lap-3',
        stageName: 'Rapid Discharge & Normal Diet',
        caption: 'Light liquid diet begins the same evening; normal walking and home return within 24 hours.',
        image: '/images/conditions/laparoscopic_cholecystectomy/2.png',
        altText: 'Rapid postoperative recovery and dietary return'
      }
    ],
    description: 'Gold-standard keyhole surgical procedure removing the diseased gallbladder containing symptomatic gallstones via tiny 5mm punctures, resulting in minimal post-op discomfort.',
    avgDuration: '30 – 50 minutes',
    hospitalStay: 'Daycare or 1 day stay',
    keyHighlights: ['Tiny cosmetic keyhole punctures (no large cuts)', 'Minimal pain & fast bowel recovery', 'Return to light work in 3 to 5 days'],
    departmentIcon: 'Stethoscope'
  }
];

// Helper to look up condition by canonical ID or alias or name
export function getConditionVisual(idOrName: string | undefined | null): ConditionVisual | undefined {
  if (!idOrName) return undefined;
  const clean = idOrName.toLowerCase().trim();

  // Direct match on id
  const directMatch = CONDITION_VISUALS.find(c => c.id.toLowerCase() === clean);
  if (directMatch) return directMatch;

  // Alias lookups
  if (clean.includes('cataract') || clean.includes('eye')) {
    return CONDITION_VISUALS.find(c => c.id === 'cataract_surgery');
  }
  if (clean.includes('knee') || clean.includes('tkr') || clean.includes('joint')) {
    return CONDITION_VISUALS.find(c => c.id === 'knee_replacement');
  }
  if (clean.includes('diabetes') || clean.includes('hba1c') || clean.includes('sugar')) {
    return CONDITION_VISUALS.find(c => c.id === 'diabetes_care');
  }
  if (clean.includes('stone') || clean.includes('litho') || clean.includes('kidney')) {
    return CONDITION_VISUALS.find(c => c.id === 'kidney_stones');
  }
  if (clean.includes('mri') || clean.includes('brain') || clean.includes('spine') || clean.includes('scan')) {
    return CONDITION_VISUALS.find(c => c.id === 'mri_brain');
  }
  if (clean.includes('blood') || clean.includes('panel') || clean.includes('cbc') || clean.includes('test')) {
    return CONDITION_VISUALS.find(c => c.id === 'blood_tests');
  }
  if (clean.includes('delivery') || clean.includes('maternity') || clean.includes('normal')) {
    return CONDITION_VISUALS.find(c => c.id === 'normal_delivery');
  }
  if (clean.includes('c_section') || clean.includes('c-section') || clean.includes('cesarean') || clean.includes('caesarean')) {
    return CONDITION_VISUALS.find(c => c.id === 'c_section');
  }
  if (clean.includes('angioplasty') || clean.includes('ptca') || clean.includes('heart') || clean.includes('cardiac') || clean.includes('stent')) {
    return CONDITION_VISUALS.find(c => c.id === 'cardiac_angioplasty');
  }
  if (clean.includes('gall') || clean.includes('lap') || clean.includes('chole') || clean.includes('laparoscopic')) {
    return CONDITION_VISUALS.find(c => c.id === 'laparoscopic_cholecystectomy');
  }

  // Name match
  return CONDITION_VISUALS.find(c => c.name.toLowerCase().includes(clean) || clean.includes(c.name.toLowerCase()));
}
