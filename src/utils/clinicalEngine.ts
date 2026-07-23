/**
 * Clinical Engine for Deterministic Follow-up Scoring and AI Dataset Generation.
 */

export interface ClinicalInputs {
  isq: number;
  boneLoss: number;
  mobility: string; // "M0", "M1", "M2", "M3"
  pain: number; // 0-10
  swelling: string; // "None", "Mild", "Moderate", "Severe"
  bleeding: string; // "None", "Mild", "Moderate", "Severe"
  daysSinceSurgery: number;
  smoking: string; // "Non-smoker", "Light Smoker", "Heavy Smoker"
  diabetes: string; // "None", "Controlled", "Uncontrolled"
  oralHygiene: string; // "Good", "Fair", "Poor"
}

export interface ClinicalOutput {
  healingScore: number;
  riskLevel: 'Low' | 'Moderate' | 'High';
  nextReviewDays: number;
  recommendation: string;
}

/**
 * Deterministic Rule-Based Clinical Engine
 */
export const calculateClinicalHealing = (inputs: ClinicalInputs): ClinicalOutput => {
  let score = 95; // Base score for a healthy healing implant

  // ISQ Impact
  if (inputs.isq >= 70) score += 5;
  else if (inputs.isq >= 60) score -= 5;
  else if (inputs.isq > 0) score -= 20;

  // Bone Loss Impact
  if (inputs.boneLoss > 0.5 && inputs.boneLoss <= 1.5) score -= 10;
  if (inputs.boneLoss > 1.5) score -= 25;

  // Mobility Impact
  if (inputs.mobility === 'M1') score -= 15;
  if (inputs.mobility === 'M2') score -= 30;
  if (inputs.mobility === 'M3') score -= 50;

  // Pain Impact
  if (inputs.pain > 3 && inputs.pain <= 6) score -= 5;
  if (inputs.pain > 6) score -= 15;

  // Swelling & Bleeding
  if (inputs.swelling === 'Mild') score -= 5;
  if (inputs.swelling === 'Moderate') score -= 10;
  if (inputs.swelling === 'Severe') score -= 20;

  if (inputs.bleeding === 'Mild') score -= 5;
  if (inputs.bleeding === 'Moderate') score -= 15;
  if (inputs.bleeding === 'Severe') score -= 25;

  // Systemic Factors
  if (inputs.smoking === 'Light Smoker') score -= 5;
  if (inputs.smoking === 'Heavy Smoker') score -= 15;

  if (inputs.diabetes === 'Controlled') score -= 5;
  if (inputs.diabetes === 'Uncontrolled') score -= 20;

  if (inputs.oralHygiene === 'Fair') score -= 5;
  if (inputs.oralHygiene === 'Poor') score -= 15;

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  // Determine Risk Level
  let riskLevel: 'Low' | 'Moderate' | 'High' = 'Low';
  if (score < 70 || inputs.mobility === 'M2' || inputs.mobility === 'M3' || inputs.diabetes === 'Uncontrolled' || inputs.boneLoss > 2.0) {
    riskLevel = 'High';
  } else if (score < 85 || inputs.pain > 5 || inputs.swelling === 'Moderate') {
    riskLevel = 'Moderate';
  }

  // Determine Recommendation & Follow-up
  let recommendation = 'Healing progressing normally. Continue routine follow-up.';
  let nextReviewDays = 30;

  if (riskLevel === 'High') {
    nextReviewDays = 3;
    if (inputs.mobility === 'M3' || inputs.mobility === 'M2') {
      recommendation = 'Implant stability reduced. Immediate specialist review recommended. Delay prosthetic loading.';
    } else if (inputs.boneLoss > 1.5 || inputs.bleeding === 'Severe') {
      recommendation = 'High risk of peri-implantitis or severe bone loss detected. Schedule CBCT evaluation immediately.';
    } else if (inputs.diabetes === 'Uncontrolled') {
      recommendation = 'Systemic factors (Uncontrolled Diabetes) severely impairing healing. Consult physician for glycemic control.';
    } else {
      recommendation = 'High risk of early failure. Recommend immediate clinical intervention and antibiotic prophylaxis.';
    }
  } else if (riskLevel === 'Moderate') {
    nextReviewDays = 14;
    if (inputs.swelling === 'Moderate' || inputs.bleeding === 'Mild' || inputs.pain > 4) {
      recommendation = 'Mild inflammation detected. Recommend chlorhexidine rinse 0.12% twice daily and review in 2 weeks.';
    } else if (inputs.oralHygiene === 'Poor') {
      recommendation = 'Plaque accumulation noted. Professional cleaning required. Reinforce oral hygiene instructions.';
    } else if (inputs.isq > 0 && inputs.isq < 65) {
      recommendation = 'Sub-optimal osseointegration observed. Maintain soft diet and avoid any loading pressure.';
    } else {
      recommendation = 'Delayed healing observed. Monitor closely and review in 14 days.';
    }
  } else {
    // Low Risk
    if (inputs.daysSinceSurgery > 90 && inputs.isq >= 70) {
      recommendation = 'Osseointegration successful. Patient is ready for restorative phase (prosthetic loading).';
      nextReviewDays = 90;
    } else if (inputs.smoking !== 'Non-smoker') {
      recommendation = 'Healing stable, but smoking poses long-term risk. Advise smoking cessation.';
    }
  }

  return {
    healingScore: score,
    riskLevel,
    nextReviewDays,
    recommendation
  };
};

/**
 * Procedural Dataset Generator
 * Generates 800 synthetic Indian patient records with specified clinical edge cases.
 */
export const generateSyntheticDataset = () => {
  const firstNames = ['Arjun', 'Rahul', 'Priya', 'Anjali', 'Vikram', 'Neha', 'Ravi', 'Sneha', 'Aditya', 'Pooja', 'Karan', 'Shruti', 'Sanjay', 'Riya', 'Mohit', 'Anita', 'Rajesh', 'Sunita', 'Karthik', 'Divya', 'Lakshmi', 'Venkatesh', 'Gaurav', 'Swati', 'Meera', 'Ramesh', 'Suresh', 'Geeta'];
  const lastNames = ['Sharma', 'Patel', 'Kumar', 'Singh', 'Gupta', 'Verma', 'Reddy', 'Nair', 'Iyer', 'Das', 'Roy', 'Joshi', 'Chauhan', 'Yadav', 'Menon', 'Bose', 'Pillai', 'Rao', 'Desai', 'Bhat'];
  
  const sites = ['Upper Left (24, 25)', 'Upper Right (14, 15)', 'Lower Left (36, 37)', 'Lower Right (46, 47)', 'Anterior Maxilla (11, 21)', 'Anterior Mandible (31, 41)'];
  const implantTypes = ['Endosteal Root Form', 'Endosteal Tapered', 'Wide Platform', 'Short Implant', 'Zygomatic (Special)'];
  
  const dataset = [];

  for (let i = 1; i <= 800; i++) {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    // Distribute edge cases based on probability
    const isHeavySmoker = Math.random() < 0.15;
    const isDiabetic = Math.random() < 0.20;
    const isUncontrolledDiabetic = isDiabetic && Math.random() < 0.3;
    const hasBruxism = Math.random() < 0.1;
    const hasOsteoporosis = Math.random() < 0.05;
    const isImmediatePlacement = Math.random() < 0.25;
    const hasBoneGraft = Math.random() < 0.35;
    const hasSinusLift = Math.random() < 0.15;
    const isElderly = Math.random() < 0.15; // Age > 65
    
    const age = isElderly ? Math.floor(Math.random() * 20) + 65 : Math.floor(Math.random() * 40) + 25;
    
    // Simulate clinical findings
    let mobility = 'M0';
    let boneLoss = Math.random() * 0.5; // Normal 0-0.5
    let pain = Math.floor(Math.random() * 3);
    let swelling = 'None';
    let bleeding = 'None';
    let isq = Math.floor(Math.random() * 20) + 65; // 65-85 normal
    
    let ohScore = Math.random() < 0.7 ? 'Good' : (Math.random() < 0.8 ? 'Fair' : 'Poor');

    // Introduce pathological conditions based on edge cases
    if (isHeavySmoker || isUncontrolledDiabetic || ohScore === 'Poor') {
      if (Math.random() < 0.3) {
        // Peri-implantitis scenario
        mobility = Math.random() < 0.5 ? 'M1' : 'M2';
        boneLoss = 1.5 + Math.random() * 2;
        pain = 4 + Math.floor(Math.random() * 5);
        swelling = 'Moderate';
        bleeding = 'Severe';
        isq -= 15;
      } else if (Math.random() < 0.4) {
        // Peri-implant mucositis
        swelling = 'Mild';
        bleeding = 'Moderate';
        pain = 2 + Math.floor(Math.random() * 3);
      }
    }

    if (hasBruxism && Math.random() < 0.4) {
      mobility = 'M1';
      pain += 2;
    }

    // Edge case: Early failure (Very rare)
    if (Math.random() < 0.01) {
      mobility = 'M3';
      boneLoss = 3.0;
      isq = 40;
      pain = 8;
      swelling = 'Severe';
    }

    // Edge case: Infection with low pain
    if (Math.random() < 0.02) {
      boneLoss = 2.0;
      swelling = 'Moderate';
      bleeding = 'Moderate';
      pain = 1;
    }

    const inputs: ClinicalInputs = {
      isq,
      boneLoss,
      mobility,
      pain,
      swelling,
      bleeding,
      daysSinceSurgery: Math.floor(Math.random() * 180) + 7,
      smoking: isHeavySmoker ? 'Heavy Smoker' : (Math.random() < 0.1 ? 'Light Smoker' : 'Non-smoker'),
      diabetes: isUncontrolledDiabetic ? 'Uncontrolled' : (isDiabetic ? 'Controlled' : 'None'),
      oralHygiene: ohScore,
    };

    const outcome = calculateClinicalHealing(inputs);

    dataset.push({
      id: `PID-80${i.toString().padStart(3, '0')}`,
      name: `${fn} ${ln}`,
      age,
      gender: Math.random() > 0.5 ? 'Male' : 'Female',
      site: sites[Math.floor(Math.random() * sites.length)],
      implantType: implantTypes[Math.floor(Math.random() * implantTypes.length)],
      isq,
      boneLoss: boneLoss.toFixed(1),
      mobility,
      pain,
      swelling,
      bleeding,
      smoking: inputs.smoking,
      diabetes: inputs.diabetes,
      oralHygiene: inputs.oralHygiene,
      edgeCases: {
        hasBruxism,
        hasOsteoporosis,
        isImmediatePlacement,
        hasBoneGraft,
        hasSinusLift,
      },
      ...outcome
    });
  }

  return dataset;
};
