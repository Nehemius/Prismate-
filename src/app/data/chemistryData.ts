export interface ReactionConcept {
  id: string;
  chapterId: string;
  name: string;
  mechanism_type: string;
  reactant_sdf: string;
  product_sdf: string;
  reagents: string;
  conditions: string;
  iupac_product_name: string;
  description: string;
  changes: string;
  is_secret_achievement?: boolean;
  achievement_hint?: string;
  achievement_title?: string;
  
  // Enriched fields from PRISMATE Build Spec
  reaction_type: "Addition" | "Elimination" | "Redox" | "Substitution";
  balanced_equation: string;
  reaction_mechanisms: string;
  structural_effects: string;
  iupac_derivation: string;
  uses_applications: string;
  page_no: number;
  class_grade: 11 | 12;
}

export interface Chapter {
  id: string;
  name: string;
  order_index: number;
}

export const CHAPTERS: Chapter[] = [
  { id: "hydrocarbons", name: "Hydrocarbons", order_index: 1 },
  { id: "haloalkanes", name: "Haloalkanes & Haloarenes", order_index: 2 },
  { id: "alcohols", name: "Alcohols, Phenols & Ethers", order_index: 3 },
  { id: "carbonyls", name: "Aldehydes, Ketones & Carboxylic Acids", order_index: 4 },
];

export const REACTION_CONCEPTS: ReactionConcept[] = [
  {
    id: "hydroboration-oxidation",
    chapterId: "hydrocarbons",
    name: "Hydroboration-Oxidation",
    mechanism_type: "syn addition",
    reactant_sdf: "propene",
    product_sdf: "propan-1-ol",
    reagents: "BH3.THF, then H2O2 / NaOH",
    conditions: "0°C to Room Temp, THF Solvent",
    iupac_product_name: "Propan-1-ol",
    description: "Addition of boron hydride (BH3) to propene followed by alkaline oxidation. Boron adds to the less substituted carbon, leading to an anti-Markovnikov alcohol.",
    changes: "The C=C double bond is converted to a C-C single bond. A hydrogen (-H) is added to the C2 position, and a hydroxyl group (-OH) is added to the C1 position in a syn-planar fashion.",
    is_secret_achievement: true,
    achievement_title: "Boron Alchemist",
    achievement_hint: "Perform a complete double cycle (Proceed -> Undo -> Proceed) on the Hydroboration reaction to activate the Boron Alchemist badge!",
    
    reaction_type: "Addition",
    balanced_equation: "3 CH3-CH=CH2 + BH3 -> (CH3-CH2-CH2)3B --[H2O2/OH-]--> 3 CH3-CH2-CH2-OH",
    reaction_mechanisms: "1. Electrophilic addition of BH3 to the double bond where boron binds to the terminal carbon and hydrogen shifts to the middle carbon (concerted syn addition).\n2. Repetition of this step two more times to yield tripropylborane.\n3. Basic oxidation using hydrogen peroxide where hydroxide deprotonates H2O2 to form hydroperoxide ion, which attacks boron. The carbon-boron bond migrates to oxygen with retention of stereochemistry, followed by alkaline hydrolysis to release propan-1-ol.",
    structural_effects: "Steric hindrance governs the regiochemistry; the bulky boron group selectively attacks the less crowded terminal sp2 carbon (C1) instead of the internal C2 carbon. Inductive electronic effects from the methyl group are minor compared to these transition state steric constraints.",
    iupac_derivation: "1. Identify longest carbon chain containing the principal functional group (-OH), which is 3 carbons (propane).\n2. Number from the end nearest the functional group, giving C1 to the carbon holding -OH.\n3. Replace the final '-e' of propane with '-1-ol' to yield the systematic name Propan-1-ol.",
    uses_applications: "Industrial synthesis of primary alcohols, manufacture of printing inks, agricultural formulations, solvent applications, and pharmaceutical intermediates.",
    page_no: 334,
    class_grade: 11
  },
  {
    id: "markovnikov-hbr",
    chapterId: "hydrocarbons",
    name: "Markovnikov HBr Addition",
    mechanism_type: "electrophilic addition",
    reactant_sdf: "propene",
    product_sdf: "2-bromopropane",
    reagents: "HBr",
    conditions: "Room Temp, CCl4 Solvent",
    iupac_product_name: "2-Bromopropane",
    description: "Electrophilic attack of H+ on propene forms the more stable secondary carbocation. The bromide ion then nucleophilically attacks the carbocation.",
    changes: "The double bond is broken. The bromine atom (-Br) bonds to the more substituted carbon (C2), and hydrogen (-H) bonds to the terminal carbon (C3).",
    
    reaction_type: "Addition",
    balanced_equation: "CH3-CH=CH2 + HBr -> CH3-CH(Br)-CH3",
    reaction_mechanisms: "1. Protonation: The nucleophilic C=C double bond attacks the H+ electrophile from HBr, generating a stable secondary carbocation intermediate on the internal C2 carbon.\n2. Nucleophilic Attack: The remaining bromide ion (Br-) attacks the carbocation center, yielding 2-bromopropane.",
    structural_effects: "The reaction is governed by Markovnikov's rule. The intermediate secondary carbocation is stabilized by hyperconjugation (6 alpha-hydrogens) and positive inductive effects (+I) from two flanking methyl groups, making it far more stable and faster to form than the primary carbocation.",
    iupac_derivation: "1. The longest continuous carbon chain has 3 carbons (propane).\n2. Numbering from either side places the bromine substituent at position 2.\n3. The prefix is 'bromo-' with location locator '2-', forming 2-Bromopropane.",
    uses_applications: "Organic solvent extraction agent, chemical intermediate in synthesizing pharmaceuticals, and alkylation agent in custom chemical labs.",
    page_no: 335,
    class_grade: 11
  },
  {
    id: "anti-markovnikov-hbr",
    chapterId: "hydrocarbons",
    name: "Anti-Markovnikov HBr Addition",
    mechanism_type: "free-radical addition",
    reactant_sdf: "propene",
    product_sdf: "1-bromopropane",
    reagents: "HBr + Benzoyl Peroxide",
    conditions: "Heat or Light",
    iupac_product_name: "1-Bromopropane",
    description: "In the presence of peroxides, the reaction proceeds via a free radical pathway. The bromine radical attacks first, forming the more stable secondary radical on C2.",
    changes: "The double bond is broken. The bromine atom (-Br) bonds to the terminal carbon (C1), and hydrogen (-H) bonds to the central carbon (C2).",
    
    reaction_type: "Addition",
    balanced_equation: "CH3-CH=CH2 + HBr --[Peroxide]--> CH3-CH2-CH2-Br",
    reaction_mechanisms: "1. Initiation: Peroxide undergoes homolytic cleavage under heat/light to form alkoxy radicals, which abstract hydrogen from HBr, generating a bromine radical (Br•).\n2. Propagation: The Br• radical attacks the terminal carbon of propene to form a stable secondary carbon radical. This secondary radical then abstracts a hydrogen atom from a fresh HBr molecule, yielding 1-bromopropane and regenerating the Br• radical.",
    structural_effects: "Regiochemical outcome is determined by radical stability. The secondary carbon radical is stabilized by hyperconjugation and methyl group electron-donation, making it more favorable than the alternative primary carbon radical. Only HBr exhibits this 'Peroxide Effect' due to favorable thermodynamics.",
    iupac_derivation: "1. Longest chain containing bromine is 3 carbons (propane).\n2. Number the chain to give the substituent the lowest locant number (C1 holds Br).\n3. Prepend '1-bromo' to 'propane', resulting in 1-Bromopropane.",
    uses_applications: "Synthesis of crop protection agents, flame retardants, pharmaceuticals, cleaner formulations, and industrial solvent replacement.",
    page_no: 336,
    class_grade: 11
  },
  {
    id: "ozonolysis",
    chapterId: "hydrocarbons",
    name: "Ozonolysis of But-2-ene",
    mechanism_type: "ozonide cleavage",
    reactant_sdf: "but-2-ene",
    product_sdf: "acetaldehyde",
    reagents: "O3, then Zn / H2O",
    conditions: "-78°C, CH2Cl2 Solvent",
    iupac_product_name: "Ethanal (2 moles)",
    description: "Ozone cleaves the carbon-carbon double bond to form an ozonide intermediate, which is reduced by zinc and water to yield two molecules of acetaldehyde.",
    changes: "The central C=C double bond is completely cleaved. Each carbon is oxidized into a carbonyl group (C=O) forming acetaldehyde.",
    
    reaction_type: "Redox",
    balanced_equation: "CH3-CH=CH-CH3 + O3 --[then Zn/H2O]--> 2 CH3-CHO",
    reaction_mechanisms: "1. Cycloaddition: Ozone reacts via 1,3-dipolar cycloaddition with the alkene to form an unstable molozonide.\n2. Rearrangement: The molozonide decomposes into a carbonyl oxide and a carbonyl compound, which quickly recombine to form a stable secondary ozonide ring.\n3. Reduction: Zinc dust abstracts the reactive oxygen atom from the ozonide, cleaving the ring into two separate molecules of ethanal (acetaldehyde) and generating ZnO.",
    structural_effects: "Cleavage occurs strictly at the double bond coordinates. The methyl groups on each side of the double bond are unaffected by the mild reductive conditions, preserving their identity as aldehyde branches.",
    iupac_derivation: "1. Each resulting fragment contains a 2-carbon chain (ethane).\n2. The principal functional group is an aldehyde (-CHO), which terminates the chain and is given locant C1.\n3. Replace '-e' of ethane with suffix '-al' to obtain Ethanal.",
    uses_applications: "Industrial synthesis of aldehydes and ketones, characterization tool for locating double bond positions in unknown natural products and polymers.",
    page_no: 341,
    class_grade: 11
  },
  {
    id: "friedel-crafts",
    chapterId: "haloalkanes",
    name: "Friedel-Crafts Alkylation",
    mechanism_type: "electrophilic aromatic substitution",
    reactant_sdf: "benzene",
    product_sdf: "toluene",
    reagents: "CH3Cl + Anhydrous AlCl3",
    conditions: "Reflux, AlCl3 catalyst",
    iupac_product_name: "Methylbenzene (Toluene)",
    description: "AlCl3 generates a methyl carbocation (CH3+) from methyl chloride. The aromatic benzene ring attacks the electrophile, followed by deprotonation to restore aromaticity.",
    changes: "A ring hydrogen (-H) is substituted by a methyl group (-CH3). The aromatic ring system remains intact.",
    
    reaction_type: "Substitution",
    balanced_equation: "C6H6 + CH3Cl --[AlCl3]--> C6H5-CH3 + HCl",
    reaction_mechanisms: "1. Electrophile Generation: Anhydrous aluminum chloride (AlCl3) acts as a Lewis acid to polarize the C-Cl bond of methyl chloride, forming a highly electrophilic complex or methyl carbocation.\n2. Arenium Ion Formation: The nucleophilic benzene pi system attacks the methyl electrophile, disrupting aromaticity to form a resonance-stabilized cyclohexadienyl cation (arenium ion).\n3. Deprotonation: The tetrachloroaluminate anion (AlCl4-) acts as a weak base, abstracting the proton from the carbon holding the methyl group to restore aromatic stability.",
    structural_effects: "The aromatic ring is highly stabilized by resonance. Once a methyl group is attached, it donates electron density to the ring via induction and hyperconjugation. This activates the ring, making it more susceptible to further polyalkylation (a classic constraint of the reaction).",
    iupac_derivation: "1. The parent ring structure is benzene.\n2. The substituent is a single carbon methyl group (-CH3).\n3. Combining them yields Methylbenzene (commonly referred to by its accepted IUPAC name, Toluene).",
    uses_applications: "Industrial precursor to benzene, benzoic acid, and trinitrotoluene (TNT); high-octane gasoline blending component; industrial solvent for paints and resins.",
    page_no: 300,
    class_grade: 12
  },
  {
    id: "sn2-substitution",
    chapterId: "haloalkanes",
    name: "SN2 Substitution",
    mechanism_type: "SN2",
    reactant_sdf: "chloromethane",
    product_sdf: "methanol",
    reagents: "Aqueous KOH",
    conditions: "Mild heating, Polar Aprotic Solvent",
    iupac_product_name: "Methanol",
    description: "A one-step bimolecular mechanism where the hydroxide nucleophile attacks the carbon from the backside, opposite the chlorine leaving group, causing stereochemical inversion.",
    changes: "The C-Cl bond is broken as the C-OH bond is formed simultaneously. The three hydrogens undergo a 'planar transition state umbrella inversion'.",
    
    reaction_type: "Substitution",
    balanced_equation: "CH3Cl + OH- -> CH3OH + Cl-",
    reaction_mechanisms: "1. Concerted Attack: The hydroxide ion (OH-) nucleophile approaches the sp3-hybridized carbon from the exact backside (180° away from the C-Cl bond).\n2. Transition State: A pentacoordinate carbon transition state is reached where the C-OH bond is half-formed and the C-Cl bond is half-broken.\n3. Departure & Inversion: The chloride ion leaves fully, and the carbon-hydrogen bonds pop into the opposite geometry like an umbrella in the wind (Walden Inversion).",
    structural_effects: "The reaction rate is heavily determined by steric hindrance at the reaction center. Since chloromethane has no methyl branches on the alpha carbon, there is negligible steric blocking, allowing rapid backside attack. Polar aprotic solvents (e.g., DMSO, acetone) accelerate this by not solvating the nucleophile.",
    iupac_derivation: "1. The longest carbon chain has only 1 carbon atom (methane).\n2. The principal functional group is an alcohol (-OH).\n3. Suffix replacement results in Methanol.",
    uses_applications: "Feedstock for manufacturing formaldehyde, acetic acid, and plastics; industrial solvent; denaturing agent for ethanol; alternative clean-burning fuel.",
    page_no: 302,
    class_grade: 12
  },
  {
    id: "sn1-substitution",
    chapterId: "haloalkanes",
    name: "SN1 Substitution",
    mechanism_type: "SN1",
    reactant_sdf: "tert-butyl-chloride",
    product_sdf: "tert-butyl-alcohol",
    reagents: "Aqueous Acetone / H2O",
    conditions: "Room Temp, Polar Protic Solvent",
    iupac_product_name: "2-Methylpropan-2-ol",
    description: "A two-step unimolecular mechanism. First, the chlorine leaving group departs to form a stable tertiary carbocation. Then, water attacks the carbocation followed by deprotonation.",
    changes: "The C-Cl bond is broken to form a carbocation intermediate. The chlorine is substituted by a hydroxyl (-OH) group.",
    
    reaction_type: "Substitution",
    balanced_equation: "(CH3)3C-Cl + H2O -> (CH3)3C-OH + HCl",
    reaction_mechanisms: "1. Ionization (Rate Determining): The polar protic solvent assists in the slow heterolytic cleavage of the C-Cl bond, forming a planar tertiary carbocation intermediate and a chloride anion.\n2. Nucleophilic Attack: A water molecule acts as a nucleophile, attacking the flat carbocation from either face with equal probability.\n3. Deprotonation: A second water molecule abstracts a proton from the oxonium intermediate to yield the neutral tertiary alcohol.",
    structural_effects: "The high stability of the tertiary carbocation is the driving force, stabilized by inductive electron donation from three methyl groups and 9 alpha-hydrogens (hyperconjugation). Polar protic solvents stabilize the transition state and leaving group via hydrogen bonding.",
    iupac_derivation: "1. The longest continuous carbon chain has 3 carbons (propane).\n2. The alcohol group (-OH) is located at C2.\n3. A methyl substituent is also attached at C2. Combining these gives 2-Methylpropan-2-ol.",
    uses_applications: "Precursor to plastics and synthetic rubber, fuel oxygenate additive, solvent for paints, and chemical synthesis intermediate.",
    page_no: 303,
    class_grade: 12
  },
  {
    id: "esterification",
    chapterId: "alcohols",
    name: "Fischer Esterification",
    mechanism_type: "nucleophilic acyl substitution",
    reactant_sdf: "ethanol",
    product_sdf: "ethyl-acetate",
    reagents: "Ethanol + Acetic Acid + Conc. H2SO4",
    conditions: "Reflux, Acid Catalyst",
    iupac_product_name: "Ethyl Ethanoate (Ethyl Acetate)",
    description: "Acid-catalyzed condensation between acetic acid and ethanol. Protonation of the carbonyl oxygen makes it highly electrophilic to the alcohol nucleophile.",
    changes: "An ester linkage (-COO-) is formed between the acetyl group and the ethyl group, releasing a molecule of water (H2O).",
    
    reaction_type: "Substitution",
    balanced_equation: "CH3-COOH + CH3-CH2-OH --[H2SO4]--> CH3-COO-CH2-CH3 + H2O",
    reaction_mechanisms: "1. Protonation: Concentrated H2SO4 protonates the carbonyl oxygen of acetic acid, rendering the carbonyl carbon highly electrophilic.\n2. Addition: Ethanol nucleophilically attacks the carbon, forming a tetrahedral intermediate. Proton transfer shifts the proton to one of the carboxylic hydroxyl groups, converting it into a good leaving group (-OH2+).\n3. Elimination & Deprotonation: Re-formation of the carbonyl double bond pushes out the water leaving group, followed by deprotonation to yield ethyl acetate.",
    structural_effects: "Steric crowding in both the carboxylic acid and alcohol can slow down the nucleophilic addition step. Acid activation is necessary because alcohols are poor nucleophiles and carboxylic acids are relatively unreactive without protonation.",
    iupac_derivation: "1. Esters are named as alkyl alkanoates.\n2. The alkyl part comes from the alcohol component: ethyl (2 carbons).\n3. The alkanoate part comes from the carboxylic acid component: ethanoate (2 carbons). Combining them gives Ethyl Ethanoate.",
    uses_applications: "A widespread extraction solvent for printing inks, glues, nail polish removers, and decaffeinating coffee beans; synthetic fruit flavoring agent.",
    page_no: 345,
    class_grade: 12
  },
  {
    id: "aldol-condensation",
    chapterId: "carbonyls",
    name: "Aldol Condensation",
    mechanism_type: "enolate nucleophilic addition",
    reactant_sdf: "acetaldehyde",
    product_sdf: "3-hydroxybutanal",
    reagents: "Dilute NaOH",
    conditions: "Cold / Mild warming",
    iupac_product_name: "3-Hydroxybutanal",
    description: "The base deprotonates the alpha-carbon of one acetaldehyde molecule to form a nucleophilic enolate. This enolate attacks the carbonyl carbon of a second acetaldehyde molecule.",
    changes: "Two acetaldehyde units are joined. A new C-C bond is formed between the alpha-carbon of one molecule and the carbonyl carbon of the second, converting the latter to an alcohol (-OH) group.",
    is_secret_achievement: true,
    achievement_title: "Aldol Apprentice",
    achievement_hint: "Perform a complete double cycle (Proceed -> Undo -> Proceed) on the Aldol reaction to activate the Aldol Apprentice badge!",
    
    reaction_type: "Addition",
    balanced_equation: "2 CH3-CHO --[dil. NaOH]--> CH3-CH(OH)-CH2-CHO",
    reaction_mechanisms: "1. Enolate Formation: Hydroxide abstracts an alpha-proton from one acetaldehyde molecule, forming a resonance-stabilized nucleophilic enolate ion.\n2. Nucleophilic Addition: The enolate carbon attacks the electrophilic carbonyl carbon of a second acetaldehyde molecule, creating a new C-C bond and forming an alkoxide intermediate.\n3. Protonation: The alkoxide abstracts a proton from water to regenerate hydroxide and form 3-hydroxybutanal (the aldol product).",
    structural_effects: "The presence of acidic alpha-hydrogens (due to the electron-withdrawing carbonyl) is mandatory. The resulting enolate intermediate is stabilized by resonance with the carbonyl oxygen (enolate geometry). Acidity of these protons facilitates easy base attack.",
    iupac_derivation: "1. The longest chain has 4 carbons containing both aldehyde and alcohol groups (butanal).\n2. Numbering starts at the aldehyde C1, placing the hydroxyl group at C3.\n3. Prefix '3-hydroxy-' appended to parent chain gives 3-Hydroxybutanal.",
    uses_applications: "Industrial synthesis of plasticizers, intermediates for making butadiene, crotonaldehyde, and fragrances.",
    page_no: 363,
    class_grade: 12
  },
  {
    id: "cannizzaro",
    chapterId: "carbonyls",
    name: "Cannizzaro Reaction",
    mechanism_type: "nucleophilic addition (hydride shift)",
    reactant_sdf: "benzaldehyde",
    product_sdf: "benzyl-alcohol",
    reagents: "Concentrated NaOH",
    conditions: "Room Temp, Non-enolizable aldehyde",
    iupac_product_name: "Benzyl Alcohol (+ Sodium Benzoate)",
    description: "Aldehydes with no alpha-hydrogens undergo self oxidation-reduction. The hydroxide attacks the carbonyl, prompting a hydride transfer to a second aldehyde molecule.",
    changes: "One molecule of benzaldehyde is reduced to benzyl alcohol, while the other is oxidized to benzoic acid (sodium salt).",
    
    reaction_type: "Redox",
    balanced_equation: "2 C6H5-CHO + NaOH -> C6H5-CH2-OH + C6H5-COONa",
    reaction_mechanisms: "1. Nucleophilic Addition: Hydroxide ion attacks the carbonyl carbon of a benzaldehyde molecule, forming a tetrahedral dianion intermediate.\n2. Hydride Transfer (Rate Limiting): The dianion acts as a hydride donor; it transfers a hydride ion (H-) directly to the carbonyl carbon of a second benzaldehyde molecule, yielding a carboxylic acid and a benzyl alkoxide.\n3. Acid-Base Swap: Proton transfer instantly occurs between the acid and alkoxide, yielding benzyl alcohol and a stable sodium benzoate salt.",
    structural_effects: "The absence of alpha-hydrogens prevents the enolization path (Aldol path). Highly concentrated base pushes this alternative hydride shift mechanism, driven by the thermodynamic stability of the carboxylate resonance system.",
    iupac_derivation: "1. The reduced product has a benzene ring connected to a single carbon alcohol (methanol parent).\n2. The substituent is a phenyl ring (-C6H5) on the methyl group.\n3. The systematic IUPAC name is Phenylmethanol (widely accepted as Benzyl Alcohol).",
    uses_applications: "Production of preservative agents, active pharmaceutical ingredients, cosmetic solvents, and high-purity laboratory benzyl esters.",
    page_no: 364,
    class_grade: 12
  }
];
