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
    achievement_hint: "Perform a complete cycle to activate the Boron Alchemist badge!",
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
    reaction_mechanisms: "1. Initiation: Homolytic cleavage of benzoyl peroxide generates phenyl radicals, which abstract hydrogen from HBr to generate bromine free radicals (Br•).\n2. Propagation: Br• attacks the terminal sp2 carbon of propene to generate a more stable secondary alkyl free radical.\n3. Chain Transfer: The secondary radical abstracts hydrogen from another HBr molecule, producing 1-bromopropane and regenerating Br•.",
    structural_effects: "Regioselectivity is governed by free radical stability: the secondary alkyl radical intermediate is stabilized by 5 hyperconjugative structures, whereas the primary alternative has only 1.",
    iupac_derivation: "1. The longest carbon chain contains 3 carbons (propane).\n2. Numbering begins at the end closest to the bromine substituent (C1).\n3. Systematic name: 1-Bromopropane.",
    uses_applications: "Degreasing solvent, precision cleaning solvent in aerospace electronics, and intermediate for agricultural chemicals.",
    page_no: 336,
    class_grade: 11
  },
  {
    id: "ozonolysis",
    chapterId: "hydrocarbons",
    name: "Ozonolysis of But-2-ene",
    mechanism_type: "oxidative cleavage",
    reactant_sdf: "but-2-ene",
    product_sdf: "acetaldehyde",
    reagents: "O3, then Zn / H2O",
    conditions: "-78°C in CH2Cl2, Reductive Workup",
    iupac_product_name: "Acetaldehyde (Ethanal)",
    description: "Ozone cleaves the alkene double bond to form an ozonide intermediate. Reductive cleavage with Zn/H2O yields two molecules of acetaldehyde.",
    changes: "The central C=C double bond is completely cleaved. Both C2 and C3 are oxidized to form carbonyl groups (C=O).",
    reaction_type: "Redox",
    balanced_equation: "CH3-CH=CH-CH3 + O3 --[Zn/H2O]--> 2 CH3-CHO + ZnO",
    reaction_mechanisms: "1. 1,3-Dipolar cycloaddition of ozone across the alkene generates an unstable molozonide.\n2. The molozonide rearranges via a retro-cycloaddition into a carbonyl oxide and carbonyl fragment, which recombine to form a stable ozonide intermediate.\n3. Reductive cleavage using zinc dust and water destroys hydrogen peroxide to prevent over-oxidation to carboxylic acid, isolating two molecules of acetaldehyde.",
    structural_effects: "Symmetric internal alkene produces a single pure carbonyl product without regioisomers. Symmetrical methyl substituents balance electron density equally across both sp2 centers.",
    iupac_derivation: "1. 2-carbon aliphatic chain with principal aldehyde group (-CHO).\n2. Alkane name 'ethane' drops '-e' and adds suffix '-al' -> Ethanal.",
    uses_applications: "Intermediate in the industrial synthesis of acetic acid, pyridine derivatives, perfumes, and synthetic resins.",
    page_no: 338,
    class_grade: 11
  },
  {
    id: "sn2-substitution",
    chapterId: "haloalkanes",
    name: "SN2 Nucleophilic Substitution",
    mechanism_type: "bimolecular substitution",
    reactant_sdf: "chloromethane",
    product_sdf: "methanol",
    reagents: "Aqueous KOH (OH- nucleophile)",
    conditions: "Room Temp, Polar Aprotic Solvent (Acetone/DMSO)",
    iupac_product_name: "Methanol",
    description: "Concerted backside nucleophilic attack by hydroxide ion on chloromethane with simultaneous departure of chloride ion, resulting in Walden inversion.",
    changes: "The C-Cl bond is broken and a new C-OH bond is formed with complete inversion of spatial geometry at the carbon center.",
    reaction_type: "Substitution",
    balanced_equation: "CH3-Cl + KOH (aq) -> CH3-OH + KCl",
    reaction_mechanisms: "1. The nucleophile (OH-) attacks the electrophilic carbon from the backside 180° opposite to the leaving group (Cl-).\n2. Passes through a pentacoordinate transition state where the carbon is approximately sp2 hybridized with partial bonds to both entering and leaving groups.\n3. Expulsion of chloride completes the reaction with complete inversion of configuration.",
    structural_effects: "Unrestricted steric accessibility of the methyl substrate yields maximum SN2 reaction rates. Absence of bulky alkyl groups permits unhindered orbital overlap in the transition state.",
    iupac_derivation: "1. 1-carbon saturated chain (methane).\n2. Replacing '-e' with alcohol suffix '-ol' -> Methanol.",
    uses_applications: "Universal chemical precursor to formaldehyde, acetic acid, biodiesels, and automotive solvent systems.",
    page_no: 302,
    class_grade: 12
  },
  {
    id: "sn1-substitution",
    chapterId: "haloalkanes",
    name: "SN1 Nucleophilic Substitution",
    mechanism_type: "unimolecular substitution",
    reactant_sdf: "tert-butyl-chloride",
    product_sdf: "tert-butyl-alcohol",
    reagents: "Aqueous NaOH / H2O",
    conditions: "Warm, Polar Protic Solvent (H2O / EtOH)",
    iupac_product_name: "2-Methylpropan-2-ol",
    description: "Two-step substitution: Rate-determining loss of chloride creates a stable tertiary carbocation, followed by rapid attack of water/hydroxide.",
    changes: "The tertiary C-Cl bond is cleaved to form a planar carbocation intermediate. An -OH group attaches to the central tertiary carbon.",
    reaction_type: "Substitution",
    balanced_equation: "(CH3)3C-Cl + H2O -> (CH3)3C-OH + HCl",
    reaction_mechanisms: "1. Heterolytic cleavage of the C-Cl bond forms a planar, sp2-hybridized tertiary carbocation and a chloride ion (rate-determining step).\n2. Fast nucleophilic attack of H2O or OH- from either face of the planar carbocation.\n3. Deprotonation yields the neutral tertiary alcohol (racemization occurs if chiral).",
    structural_effects: "Tertiary carbocation intermediate is strongly stabilized by 9 hyperconjugative alpha-hydrogens and three inductive electron-donating methyl groups (+I).",
    iupac_derivation: "1. Longest continuous chain is 3 carbons (propane).\n2. Functional group -OH is on C2 (propan-2-ol).\n3. Methyl substituent is located on C2 -> 2-Methylpropan-2-ol.",
    uses_applications: "Industrial solvent, paint remover ingredient, denaturant for ethanol, and intermediate in synthetic musk perfume manufacturing.",
    page_no: 304,
    class_grade: 12
  },
  {
    id: "friedel-crafts",
    chapterId: "hydrocarbons",
    name: "Friedel-Crafts Alkylation",
    mechanism_type: "electrophilic aromatic substitution",
    reactant_sdf: "benzene",
    product_sdf: "toluene",
    reagents: "CH3Cl + Anhydrous AlCl3",
    conditions: "Room Temp, Anhydrous Conditions",
    iupac_product_name: "Toluene (Methylbenzene)",
    description: "Anhydrous AlCl3 generates an electrophilic methyl cation complex from CH3Cl. Benzene's pi system attacks the electrophile, followed by rearomatization to form toluene.",
    changes: "An aromatic C-H bond on benzene is replaced by a methyl group (-CH3), yielding methylbenzene.",
    reaction_type: "Substitution",
    balanced_equation: "C6H6 + CH3Cl --[Anhydrous AlCl3]--> C6H5-CH3 + HCl",
    reaction_mechanisms: "1. Complexation: CH3Cl coordinates with the Lewis acid AlCl3 to form a polarized [CH3(+) ... AlCl4(-)] complex.\n2. Electrophilic Attack: Pi electron cloud of benzene attacks the methyl cation, forming a resonance-stabilized arenium ion (sigma complex).\n3. Rearomatization: AlCl4(-) abstracts the proton from the sp3 ring carbon, restoring aromatic ring resonance energy and regenerating AlCl3.",
    structural_effects: "The aromatic sextet resonance stabilization energy (36 kcal/mol) drives rapid loss of proton from the sigma complex. The introduced methyl group activates the ring for further electrophilic attacks.",
    iupac_derivation: "1. Parent aromatic ring is benzene.\n2. One hydrogen substituted by a methyl group -> Methylbenzene (Toluene).",
    uses_applications: "Precursor to polyurethane foams, aviation fuel high-octane additive, solvent for paints, coatings, and adhesives.",
    page_no: 342,
    class_grade: 11
  },
  {
    id: "esterification",
    chapterId: "alcohols",
    name: "Fischer Esterification",
    mechanism_type: "nucleophilic acyl substitution",
    reactant_sdf: "acetic-acid",
    product_sdf: "ethyl-acetate",
    reagents: "Ethanol (CH3CH2OH) + Conc. H2SO4",
    conditions: "Reflux, Acid Catalyst",
    iupac_product_name: "Ethyl Ethanoate (Ethyl Acetate)",
    description: "Acid-catalyzed condensation between acetic acid and ethanol. Protonation of the carbonyl oxygen enhances electrophilicity, allowing nucleophilic attack by ethanol to form ethyl acetate.",
    changes: "The -OH of the carboxylic acid is replaced with an -OCH2CH3 group from ethanol with condensation of one water molecule.",
    reaction_type: "Substitution",
    balanced_equation: "CH3-COOH + CH3-CH2-OH <==[H+]=> CH3-COO-CH2-CH3 + H2O",
    reaction_mechanisms: "1. Protonation of the carboxylic acid carbonyl oxygen activates it toward nucleophilic attack.\n2. Nucleophilic attack by ethanol oxygen creates a tetrahedral intermediate.\n3. Proton transfer converts one -OH into a good leaving group (-OH2+).\n4. Elimination of water followed by deprotonation yields the ester.",
    structural_effects: "Steric crowding around the alpha carbon of either acid or alcohol lowers the equilibrium rate constant. Concentrated sulfuric acid acts as both catalyst and dehydrating agent, shifting equilibrium forward.",
    iupac_derivation: "1. Alkyl group attached to ester oxygen is named first: 'ethyl'.\n2. Acyl portion contains 2 carbons: ethanoic acid becomes 'ethanoate' -> Ethyl ethanoate.",
    uses_applications: "Primary solvent in paints, varnishes, glues, nail polish remover, and confectionery artificial fruit flavoring.",
    page_no: 328,
    class_grade: 12
  },
  {
    id: "aldol-condensation",
    chapterId: "carbonyls",
    name: "Aldol Condensation",
    mechanism_type: "nucleophilic addition-elimination",
    reactant_sdf: "acetaldehyde",
    product_sdf: "3-hydroxybutanal",
    reagents: "Dilute NaOH (aq)",
    conditions: "0°C to Room Temp",
    iupac_product_name: "3-Hydroxybutanal",
    description: "Dilute base deprotonates an alpha-hydrogen of acetaldehyde to generate a resonance-stabilized enolate ion, which nucleophilically attacks another acetaldehyde molecule to form a beta-hydroxy aldehyde.",
    changes: "A new carbon-carbon bond connects C2 of the enolate to the carbonyl carbon (C1) of the electrophile, yielding a beta-hydroxy aldehyde.",
    reaction_type: "Addition",
    balanced_equation: "2 CH3-CHO --[Dilute NaOH]--> CH3-CH(OH)-CH2-CHO",
    reaction_mechanisms: "1. Base abstracts an acidic alpha-hydrogen from acetaldehyde, generating an enolate carbanion.\n2. Enolate attacks the electrophilic carbonyl carbon of a second acetaldehyde molecule to form an alkoxide intermediate.\n3. Protonation of alkoxide by water generates 3-hydroxybutanal (aldol) and regenerates hydroxide catalyst.",
    structural_effects: "Alpha-hydrogen acidity (pKa ~17) is significantly increased due to resonance stabilization with the adjacent carbonyl pi system, enabling mild basic enolization.",
    iupac_derivation: "1. 4-carbon chain containing principal aldehyde group at C1 (butanal).\n2. Hydroxyl substituent located at C3 -> 3-Hydroxybutanal.",
    uses_applications: "Key organic intermediate in the industrial synthesis of 1,3-butanediol, crotonaldehyde, synthetic pharmaceuticals, and perfumery odorants.",
    page_no: 365,
    class_grade: 12
  },
  {
    id: "cannizzaro",
    chapterId: "carbonyls",
    name: "Cannizzaro Reaction",
    mechanism_type: "disproportionation redox",
    reactant_sdf: "benzaldehyde",
    product_sdf: "benzyl-alcohol",
    reagents: "50% Conc. NaOH / KOH",
    conditions: "Room Temp to Gentle Heat",
    iupac_product_name: "Benzyl Alcohol & Benzoic Acid",
    description: "Non-enolizable aldehydes lacking alpha-hydrogens undergo self-oxidation-reduction in strong base: one molecule is reduced to benzyl alcohol while the other is oxidized to sodium benzoate.",
    changes: "One benzaldehyde molecule gains two hydrogens at the carbonyl carbon to become benzyl alcohol, while the other is oxidized to a carboxylate salt.",
    reaction_type: "Redox",
    balanced_equation: "2 C6H5-CHO + NaOH -> C6H5-CH2-OH + C6H5-COONa",
    reaction_mechanisms: "1. Hydroxide attacks the carbonyl carbon of benzaldehyde, forming a dianionic tetrahedral intermediate in concentrated base.\n2. Hydride ion (H:-) transfers directly from this intermediate to the carbonyl carbon of a second benzaldehyde molecule.\n3. Rapid proton exchange produces benzyl alcohol and benzoate anion.",
    structural_effects: "Absence of alpha-hydrogens completely suppresses enolization and aldol pathways, forcing the reaction down the intermolecular hydride transfer route.",
    iupac_derivation: "1. Phenyl substituent attached to carbinol carbon -> Phenylmethanol (Benzyl alcohol).\n2. Oxidized counterpart -> Benzoic acid.",
    uses_applications: "Synthesis of aromatic alcohols, preservative in injectable drugs, solvent for inks and epoxy coatings.",
    page_no: 368,
    class_grade: 12
  }
];
