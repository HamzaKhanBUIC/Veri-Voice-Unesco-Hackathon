# VeriVoice Test Case ↔ Candidate Evidence Mapping

## Overview
This document maps each of the 40 test cases from `3. Test Suite/` (`Test Suite — (False Claims).xlsx` and `Test Suite — (True Facts).xlsx`) to their corresponding source file in the archive and candidate evidence ID in `analysis/validated-candidate-health-evidence.json`.

---

## 1. False Claims Test Suite (20 Cases)

| Test Case ID | Domain | Original User Claim | Expected Verdict | Matching Archive Source | Candidate ID | Match Status |
|---|---|---|---|---|---|---|
| **F01** | Health | "Garlic can prevent or cure COVID-19." | **FALSE** | `1. Curated Knowledge Base Document/01_Health_Misinformation/Official Facts/1. WHO/WHO_Vaccine Safety/WHO COVID-19 Mythbusters.txt` | `candidate-010` | `PARTIAL_MATCH` |
| **F02** | Health | "Cold weather kills the COVID-19 virus." | **FALSE** | `N/A` | `NO CANDIDATE` | `NO_MATCH` |
| **F03** | Health | "Antibiotics can cure COVID-19." | **FALSE** | `N/A` | `NO CANDIDATE` | `NO_MATCH` |
| **F04** | Vaccine | "COVID-19 vaccines contain microchips to track people." | **FALSE** | `1. Curated Knowledge Base Document/01_Health_Misinformation/Myth Claims/2. PAHO/PAHO Health Misinformation.txt` | `candidate-002` | `PARTIAL_MATCH` |
| **F05** | Vaccine | "Vaccines are released without proper safety testing." | **FALSE** | `1. Curated Knowledge Base Document/01_Health_Misinformation/Official Facts/1. WHO/WHO_Vaccine Safety/Vaccine Safety WHO.txt` | `candidate-009` | `PARTIAL_MATCH` |
| **F06** | Vaccine | "Serious side effects from vaccines are common." | **FALSE** | `N/A` | `NO CANDIDATE` | `NO_MATCH` |
| **F07** | Vaccine | "Aluminum in vaccines causes chronic diseases in children." | **FALSE** | `1. Curated Knowledge Base Document/01_Health_Misinformation/Myth Claims/2. PAHO/PAHO Health Misinformation.txt` | `candidate-002` | `PARTIAL_MATCH` |
| **F08** | Vaccine | "Every illness after vaccination is caused by the vaccine." | **FALSE** | `1. Curated Knowledge Base Document/01_Health_Misinformation/Myth Claims/2. PAHO/PAHO Health Misinformation.txt` | `candidate-002` | `PARTIAL_MATCH` |
| **F09** | Vaccine | "Any adverse event after vaccination proves the vaccine is unsafe." | **FALSE** | `1. Curated Knowledge Base Document/01_Health_Misinformation/Myth Claims/2. PAHO/PAHO Health Misinformation.txt` | `candidate-002` | `PARTIAL_MATCH` |
| **F10** | Vaccine | "The dengue vaccine should be introduced in every country regardless of local conditions." | **FALSE** | `1. Curated Knowledge Base Document/01_Health_Misinformation/Myth Claims/2. PAHO/PAHO Health Misinformation.txt` | `candidate-002` | `PARTIAL_MATCH` |
| **F11** | Mental Health | "Mental health is not part of overall health." | **FALSE** | `1. Curated Knowledge Base Document/01_Health_Misinformation/Myth Claims/1. WHO/WHO_Mythbusters.txt` | `candidate-001` | `PARTIAL_MATCH` |
| **F12** | Mental Health | "Only people with mental illness need to care about mental health." | **FALSE** | `1. Curated Knowledge Base Document/01_Health_Misinformation/Myth Claims/2. PAHO/PAHO Health Misinformation.txt` | `candidate-002` | `PARTIAL_MATCH` |
| **F13** | Heat &amp; Health | "Heatwaves are uncomfortable but do not affect human health." | **FALSE** | `1. Curated Knowledge Base Document/01_Health_Misinformation/Official Facts/1. WHO/WHO_Heat Waves/WHO_Heat Waves.txt` | `candidate-006` | `PARTIAL_MATCH` |
| **F14** | Heat &amp; Health | "Only older adults are affected by extreme heat." | **FALSE** | `1. Curated Knowledge Base Document/01_Health_Misinformation/Official Facts/1. WHO/WHO_Heat Waves/WHO_Heat Waves.txt` | `candidate-006` | `PARTIAL_MATCH` |
| **F15** | Media &amp; Information Literacy | "Everything shared on social media is trustworthy if many people share it." | **FALSE** | `1. Curated Knowledge Base Document/01_Health_Misinformation/Myth Claims/3. UNESCO/UNESCO_Misinformation.txt` | `candidate-003` | `PARTIAL_MATCH` |
| **F16** | Media &amp; Information Literacy | "People do not need media literacy skills to identify misinformation." | **FALSE** | `1. Curated Knowledge Base Document/01_Health_Misinformation/Myth Claims/2. PAHO/PAHO Health Misinformation.txt` | `candidate-002` | `PARTIAL_MATCH` |
| **F17** | Disaster Risk Reduction | "All children experience disasters in exactly the same way." | **FALSE** | `N/A` | `NO CANDIDATE` | `NO_MATCH` |
| **F18** | Disaster Risk Reduction | "Girls and boys face the same disaster risks and recovery challenges." | **FALSE** | `N/A` | `NO CANDIDATE` | `NO_MATCH` |
| **F19** | Disaster Risk Reduction | "Including girls in disaster programmes automatically achieves gender equality." | **FALSE** | `N/A` | `NO CANDIDATE` | `NO_MATCH` |
| **F20** | Vaccine Misinformation | "Personal stories are enough to prove that vaccines are unsafe." | **FALSE** | `1. Curated Knowledge Base Document/01_Health_Misinformation/Official Facts/1. WHO/WHO_Vaccine Safety/Vaccine Safety WHO.txt` | `candidate-009` | `PARTIAL_MATCH` |

---

## 2. True Facts Test Suite (20 Cases)

| Test Case ID | Domain | Original User Claim | Expected Verdict | Matching Archive Source | Candidate ID | Match Status |
|---|---|---|---|---|---|---|
| **T01** | Vaccine | "Vaccines undergo rigorous safety testing before they are approved." | **TRUE** | `1. Curated Knowledge Base Document/01_Health_Misinformation/Official Facts/1. WHO/WHO_Vaccine Safety/Vaccine Safety WHO.txt` | `candidate-009` | `PARTIAL_MATCH` |
| **T02** | Vaccine | "Vaccine safety continues to be monitored after vaccines are introduced." | **TRUE** | `1. Curated Knowledge Base Document/01_Health_Misinformation/Myth Claims/2. PAHO/PAHO Health Misinformation.txt` | `candidate-002` | `PARTIAL_MATCH` |
| **T03** | Vaccine | "Most vaccine side effects are mild and temporary." | **TRUE** | `1. Curated Knowledge Base Document/01_Health_Misinformation/Official Facts/2. PAHO/PAHO_Vaccine Safety/PAHO Vaccine Safety.txt` | `candidate-013` | `PARTIAL_MATCH` |
| **T04** | Vaccine | "Vaccination has saved millions of lives around the world." | **TRUE** | `N/A` | `NO CANDIDATE` | `NO_MATCH` |
| **T05** | Vaccine | "Not every illness that occurs after vaccination is caused by the vaccine." | **TRUE** | `1. Curated Knowledge Base Document/01_Health_Misinformation/Myth Claims/2. PAHO/PAHO Health Misinformation.txt` | `candidate-002` | `PARTIAL_MATCH` |
| **T06** | Vaccine | "Adverse events following immunization should be investigated scientifically before determining their cause." | **TRUE** | `1. Curated Knowledge Base Document/01_Health_Misinformation/Myth Claims/2. PAHO/PAHO Health Misinformation.txt` | `candidate-002` | `PARTIAL_MATCH` |
| **T07** | Dengue Vaccine | "QDENGA vaccine recommendations depend on local dengue epidemiology." | **TRUE** | `1. Curated Knowledge Base Document/01_Health_Misinformation/Official Facts/2. PAHO/PAHO_Dengue/PAHO Dengue.txt` | `candidate-012` | `PARTIAL_MATCH` |
| **T08** | Dengue Vaccine | "Dengue vaccine safety should continue to be monitored after introduction." | **TRUE** | `1. Curated Knowledge Base Document/01_Health_Misinformation/Myth Claims/2. PAHO/PAHO Health Misinformation.txt` | `candidate-002` | `PARTIAL_MATCH` |
| **T09** | Mental Health | "Mental health is an essential part of overall health and well-being." | **TRUE** | `1. Curated Knowledge Base Document/01_Health_Misinformation/Myth Claims/1. WHO/WHO_Mythbusters.txt` | `candidate-001` | `PARTIAL_MATCH` |
| **T10** | Heat &amp; Health | "Extreme heat can increase illness and the risk of premature death." | **TRUE** | `1. Curated Knowledge Base Document/01_Health_Misinformation/Official Facts/1. WHO/WHO_Heat Waves/WHO_Heat Waves.txt` | `candidate-006` | `PARTIAL_MATCH` |
| **T11** | Mental Health | "Everyone has mental health, and it is important at every stage of life." | **TRUE** | `1. Curated Knowledge Base Document/01_Health_Misinformation/Official Facts/1. WHO/WHO_Dengue/WHO Dengue.txt` | `candidate-004` | `PARTIAL_MATCH` |
| **T12** | Media &amp; Information Literacy | "Checking information with trusted sources helps reduce misinformation." | **TRUE** | `1. Curated Knowledge Base Document/01_Health_Misinformation/Myth Claims/2. PAHO/PAHO Health Misinformation.txt` | `candidate-002` | `PARTIAL_MATCH` |
| **Navigating the Infodemic with Media and Information Literacy (MIL)** | Media &amp; Information Literacy | "T13" | **TRUE** | `N/A` | `NO CANDIDATE` | `NO_MATCH` |
| **UNESCO explains that critical thinking and source evaluation are core competencies of Media and Information Literacy and help people distinguish reliable information from misinformation.** | Media &amp; Information Literacy | "T14" | **TRUE** | `N/A` | `NO CANDIDATE` | `NO_MATCH` |
| **UNESCO recommends evaluating the credibility, accuracy, and source of online information before accepting or sharing it.** | T15 | "Disaster Risk Reduction" | **TRUE** | `N/A` | `NO CANDIDATE` | `NO_MATCH` |
| **GADRRRES –** | T15 | "Research into Action Brief: Child-centred Disaster Risk Reduction" | **TRUE** | `1. Curated Knowledge Base Document/02_Disaster_Climate_Misinformtion/1. BNPB/BNPB.txt` | `candidate-014` | `PARTIAL_MATCH` |
| **Disaster risk reduction programmes should consider children's different needs and vulnerabilities.** | T15 | "GADRRRES recommends child-centred approaches that recognize differences in age, gender, disability, and social context when planning disaster risk reduction activities." | **TRUE** | `1. Curated Knowledge Base Document/02_Disaster_Climate_Misinformtion/1. BNPB/BNPB.txt` | `candidate-014` | `PARTIAL_MATCH` |
| **GADRRRES explains that gender norms and inequalities influence children's exposure to risks, access to resources, and recovery after disasters.** | T15 | "GADRRRES –" | **TRUE** | `N/A` | `NO CANDIDATE` | `NO_MATCH` |
| **Schools play an important role in disaster preparedness and resilience.** | T15 | "GADRRRES states that comprehensive school safety helps protect students, maintain learning continuity, and strengthen community resilience before, during, and after disasters." | **TRUE** | `1. Curated Knowledge Base Document/01_Health_Misinformation/Official Facts/1. WHO/WHO_Heat Waves/WHO_Heat Waves.txt` | `candidate-006` | `PARTIAL_MATCH` |
| **T19** | Maintaining access to education after a disaster supports children's recovery and well-being. | "GADRRRES explains that educational continuity following disasters contributes to children's protection, psychosocial well-being, and long-term recovery." | **TRUE** | `1. Curated Knowledge Base Document/02_Disaster_Climate_Misinformtion/2. GADRRRES/GADRESS.txt` | `candidate-015` | `PARTIAL_MATCH` |

---

## 3. Detailed Passage Mapping Details

### [F01] Garlic can prevent or cure COVID-19.
- **Expected Verdict**: `FALSE`
- **Cited Source**: WHO – Coronavirus Disease (COVID-19) Advice for the Public: Mythbusters
- **Matching Archive File**: `1. Curated Knowledge Base Document/01_Health_Misinformation/Official Facts/1. WHO/WHO_Vaccine Safety/WHO COVID-19 Mythbusters.txt`
- **Candidate ID**: `candidate-010`
- **Match Status**: `PARTIAL_MATCH`
- **Supporting Passage**: "Title: Garlic does not prevent COVID-19  Topic: Health Misinformation  Claim: Eating garlic prevents or cures COVID-19.  Verified Information: WHO states that there is no evidence that eating garlic protects people from COVID-19 or cures the disease. Garlic is a healthy food but it does not prevent COVID-19 infection.  Keywords: garlic, COVID-19, prevention, myth, health misinformation  Source: WH"

### [F02] Cold weather kills the COVID-19 virus.
- **Expected Verdict**: `FALSE`
- **Cited Source**: WHO – Coronavirus Disease (COVID-19) Advice for the Public: Mythbusters
- **Matching Archive File**: `N/A`
- **Candidate ID**: `NO CANDIDATE`
- **Match Status**: `NO_MATCH`
- **Supporting Passage**: "N/A"

### [F03] Antibiotics can cure COVID-19.
- **Expected Verdict**: `FALSE`
- **Cited Source**: WHO – Coronavirus Disease (COVID-19) Advice for the Public: Mythbusters
- **Matching Archive File**: `N/A`
- **Candidate ID**: `NO CANDIDATE`
- **Match Status**: `NO_MATCH`
- **Supporting Passage**: "N/A"

### [F04] COVID-19 vaccines contain microchips to track people.
- **Expected Verdict**: `FALSE`
- **Cited Source**: WHO – Coronavirus Disease (COVID-19) Advice for the Public: Mythbusters
- **Matching Archive File**: `1. Curated Knowledge Base Document/01_Health_Misinformation/Myth Claims/2. PAHO/PAHO Health Misinformation.txt`
- **Candidate ID**: `candidate-002`
- **Match Status**: `PARTIAL_MATCH`
- **Supporting Passage**: "Title: Vaccines Cause Harm  Topic: Health Misinformation  Claim: Vaccination causes harm and is more dangerous than the diseases it prevents.  Verified Information: PAHO explains that misinformation suggesting vaccines are harmful can reduce public trust and vaccination uptake. Health workers should rely on evidence-based information, communicate transparently, and direct people to credible public"

### [F05] Vaccines are released without proper safety testing.
- **Expected Verdict**: `FALSE`
- **Cited Source**: WHO – Vaccines and Immunization: Vaccine Safety
- **Matching Archive File**: `1. Curated Knowledge Base Document/01_Health_Misinformation/Official Facts/1. WHO/WHO_Vaccine Safety/Vaccine Safety WHO.txt`
- **Candidate ID**: `candidate-009`
- **Match Status**: `PARTIAL_MATCH`
- **Supporting Passage**: "Vaccines and immunization: Vaccine safety WHO  https://www.who.int/news-room/questions-and-answers/item/vaccines-and-immunization-vaccine-safety  1. Contribution of vaccination to improved survival and health: modelling 50 years of the Expanded Programme on Immunization. Shattock, Andrew J et al. The Lancet, Volume 403, Issue 10441, 2307 - 2316. https://www.thelancet.com/journals/lancet/article/PI"

### [F06] Serious side effects from vaccines are common.
- **Expected Verdict**: `FALSE`
- **Cited Source**: WHO – Vaccines and Immunization: Vaccine Safety
- **Matching Archive File**: `N/A`
- **Candidate ID**: `NO CANDIDATE`
- **Match Status**: `NO_MATCH`
- **Supporting Passage**: "N/A"

### [F07] Aluminum in vaccines causes chronic diseases in children.
- **Expected Verdict**: `FALSE`
- **Cited Source**: WHO – Vaccines and Immunization: Vaccine Safety
- **Matching Archive File**: `1. Curated Knowledge Base Document/01_Health_Misinformation/Myth Claims/2. PAHO/PAHO Health Misinformation.txt`
- **Candidate ID**: `candidate-002`
- **Match Status**: `PARTIAL_MATCH`
- **Supporting Passage**: "Title: Vaccines Cause Harm  Topic: Health Misinformation  Claim: Vaccination causes harm and is more dangerous than the diseases it prevents.  Verified Information: PAHO explains that misinformation suggesting vaccines are harmful can reduce public trust and vaccination uptake. Health workers should rely on evidence-based information, communicate transparently, and direct people to credible public"

### [F08] Every illness after vaccination is caused by the vaccine.
- **Expected Verdict**: `FALSE`
- **Cited Source**: PAHO – Manual for Surveillance of Events Supposedly Attributable to Vaccination or Immunization in the Region of the Americas
- **Matching Archive File**: `1. Curated Knowledge Base Document/01_Health_Misinformation/Myth Claims/2. PAHO/PAHO Health Misinformation.txt`
- **Candidate ID**: `candidate-002`
- **Match Status**: `PARTIAL_MATCH`
- **Supporting Passage**: "Title: Vaccines Cause Harm  Topic: Health Misinformation  Claim: Vaccination causes harm and is more dangerous than the diseases it prevents.  Verified Information: PAHO explains that misinformation suggesting vaccines are harmful can reduce public trust and vaccination uptake. Health workers should rely on evidence-based information, communicate transparently, and direct people to credible public"

### [F09] Any adverse event after vaccination proves the vaccine is unsafe.
- **Expected Verdict**: `FALSE`
- **Cited Source**: PAHO – Manual for Surveillance of Events Supposedly Attributable to Vaccination or Immunization in the Region of the Americas
- **Matching Archive File**: `1. Curated Knowledge Base Document/01_Health_Misinformation/Myth Claims/2. PAHO/PAHO Health Misinformation.txt`
- **Candidate ID**: `candidate-002`
- **Match Status**: `PARTIAL_MATCH`
- **Supporting Passage**: "Title: Vaccines Cause Harm  Topic: Health Misinformation  Claim: Vaccination causes harm and is more dangerous than the diseases it prevents.  Verified Information: PAHO explains that misinformation suggesting vaccines are harmful can reduce public trust and vaccination uptake. Health workers should rely on evidence-based information, communicate transparently, and direct people to credible public"

### [F10] The dengue vaccine should be introduced in every country regardless of local conditions.
- **Expected Verdict**: `FALSE`
- **Cited Source**: PAHO – Regional Guidelines for Dengue Vaccine Safety Surveillance: QDENGA (TAK-003)
- **Matching Archive File**: `1. Curated Knowledge Base Document/01_Health_Misinformation/Myth Claims/2. PAHO/PAHO Health Misinformation.txt`
- **Candidate ID**: `candidate-002`
- **Match Status**: `PARTIAL_MATCH`
- **Supporting Passage**: "Title: Vaccines Cause Harm  Topic: Health Misinformation  Claim: Vaccination causes harm and is more dangerous than the diseases it prevents.  Verified Information: PAHO explains that misinformation suggesting vaccines are harmful can reduce public trust and vaccination uptake. Health workers should rely on evidence-based information, communicate transparently, and direct people to credible public"

### [F11] Mental health is not part of overall health.
- **Expected Verdict**: `FALSE`
- **Cited Source**: WHO – Mental Health
- **Matching Archive File**: `1. Curated Knowledge Base Document/01_Health_Misinformation/Myth Claims/1. WHO/WHO_Mythbusters.txt`
- **Candidate ID**: `candidate-001`
- **Match Status**: `PARTIAL_MATCH`
- **Supporting Passage**: "Organization : WHO  Title : Coronavirus disease (COVID-19) advice for the public: Mythbusters  Type : Official Website  URL :  https://www.who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public/myth-busters  https://www.who.int/indonesia/news/novel-coronavirus/mythbusters  https://www.emro.who.int/health-topics/corona-virus/covid-19-myth-busters.html"

### [F12] Only people with mental illness need to care about mental health.
- **Expected Verdict**: `FALSE`
- **Cited Source**: WHO – Mental Health
- **Matching Archive File**: `1. Curated Knowledge Base Document/01_Health_Misinformation/Myth Claims/2. PAHO/PAHO Health Misinformation.txt`
- **Candidate ID**: `candidate-002`
- **Match Status**: `PARTIAL_MATCH`
- **Supporting Passage**: "Title: Vaccines Cause Harm  Topic: Health Misinformation  Claim: Vaccination causes harm and is more dangerous than the diseases it prevents.  Verified Information: PAHO explains that misinformation suggesting vaccines are harmful can reduce public trust and vaccination uptake. Health workers should rely on evidence-based information, communicate transparently, and direct people to credible public"

### [F13] Heatwaves are uncomfortable but do not affect human health.
- **Expected Verdict**: `FALSE`
- **Cited Source**: WHO – Heat and Health
- **Matching Archive File**: `1. Curated Knowledge Base Document/01_Health_Misinformation/Official Facts/1. WHO/WHO_Heat Waves/WHO_Heat Waves.txt`
- **Candidate ID**: `candidate-006`
- **Match Status**: `PARTIAL_MATCH`
- **Supporting Passage**: "Title: Heatwaves can cause serious illness and death  Topic: Climate Misinformation  Claim: Heatwaves are only uncomfortable and do not pose serious health risks.  Verified Information: WHO states that heatwaves can significantly increase illness and mortality, particularly among older adults, infants, people with chronic diseases, and socially vulnerable populations. The risk increases during pro"

### [F14] Only older adults are affected by extreme heat.
- **Expected Verdict**: `FALSE`
- **Cited Source**: WHO – Heat and Health
- **Matching Archive File**: `1. Curated Knowledge Base Document/01_Health_Misinformation/Official Facts/1. WHO/WHO_Heat Waves/WHO_Heat Waves.txt`
- **Candidate ID**: `candidate-006`
- **Match Status**: `PARTIAL_MATCH`
- **Supporting Passage**: "Title: Heatwaves can cause serious illness and death  Topic: Climate Misinformation  Claim: Heatwaves are only uncomfortable and do not pose serious health risks.  Verified Information: WHO states that heatwaves can significantly increase illness and mortality, particularly among older adults, infants, people with chronic diseases, and socially vulnerable populations. The risk increases during pro"

### [F15] Everything shared on social media is trustworthy if many people share it.
- **Expected Verdict**: `FALSE`
- **Cited Source**: UNESCO – Navigating the Infodemic with Media and Information Literacy (MIL)
- **Matching Archive File**: `1. Curated Knowledge Base Document/01_Health_Misinformation/Myth Claims/3. UNESCO/UNESCO_Misinformation.txt`
- **Candidate ID**: `candidate-003`
- **Match Status**: `PARTIAL_MATCH`
- **Supporting Passage**: "Title: Critical Thinking Is Essential to Identify Misinformation  Topic: Health Misinformation  Claim: People can easily distinguish true information from misinformation without critical thinking skills.  Verified Information: UNESCO explains that Media and Information Literacy (MIL) equips people with the ability to critically access, analyze, evaluate, create, and share information. These compet"

### [F16] People do not need media literacy skills to identify misinformation.
- **Expected Verdict**: `FALSE`
- **Cited Source**: UNESCO – Navigating the Infodemic with Media and Information Literacy (MIL)
- **Matching Archive File**: `1. Curated Knowledge Base Document/01_Health_Misinformation/Myth Claims/2. PAHO/PAHO Health Misinformation.txt`
- **Candidate ID**: `candidate-002`
- **Match Status**: `PARTIAL_MATCH`
- **Supporting Passage**: "Title: Vaccines Cause Harm  Topic: Health Misinformation  Claim: Vaccination causes harm and is more dangerous than the diseases it prevents.  Verified Information: PAHO explains that misinformation suggesting vaccines are harmful can reduce public trust and vaccination uptake. Health workers should rely on evidence-based information, communicate transparently, and direct people to credible public"

### [F17] All children experience disasters in exactly the same way.
- **Expected Verdict**: `FALSE`
- **Cited Source**: GADRRRES – Gender and Disasters: Considering Children
- **Matching Archive File**: `N/A`
- **Candidate ID**: `NO CANDIDATE`
- **Match Status**: `NO_MATCH`
- **Supporting Passage**: "N/A"

### [F18] Girls and boys face the same disaster risks and recovery challenges.
- **Expected Verdict**: `FALSE`
- **Cited Source**: GADRRRES – Gender and Disasters: Considering Children
- **Matching Archive File**: `N/A`
- **Candidate ID**: `NO CANDIDATE`
- **Match Status**: `NO_MATCH`
- **Supporting Passage**: "N/A"

### [F19] Including girls in disaster programmes automatically achieves gender equality.
- **Expected Verdict**: `FALSE`
- **Cited Source**: GADRRRES – Gender and Disasters: Considering Children
- **Matching Archive File**: `N/A`
- **Candidate ID**: `NO CANDIDATE`
- **Match Status**: `NO_MATCH`
- **Supporting Passage**: "N/A"

### [F20] Personal stories are enough to prove that vaccines are unsafe.
- **Expected Verdict**: `FALSE`
- **Cited Source**: PAHO – Combating False Information on Vaccines: A Guide for EPI Managers
- **Matching Archive File**: `1. Curated Knowledge Base Document/01_Health_Misinformation/Official Facts/1. WHO/WHO_Vaccine Safety/Vaccine Safety WHO.txt`
- **Candidate ID**: `candidate-009`
- **Match Status**: `PARTIAL_MATCH`
- **Supporting Passage**: "Vaccines and immunization: Vaccine safety WHO  https://www.who.int/news-room/questions-and-answers/item/vaccines-and-immunization-vaccine-safety  1. Contribution of vaccination to improved survival and health: modelling 50 years of the Expanded Programme on Immunization. Shattock, Andrew J et al. The Lancet, Volume 403, Issue 10441, 2307 - 2316. https://www.thelancet.com/journals/lancet/article/PI"

### [T01] Vaccines undergo rigorous safety testing before they are approved.
- **Expected Verdict**: `TRUE`
- **Cited Source**: WHO – Vaccines and Immunization: &#10;Vaccine Safety
- **Matching Archive File**: `1. Curated Knowledge Base Document/01_Health_Misinformation/Official Facts/1. WHO/WHO_Vaccine Safety/Vaccine Safety WHO.txt`
- **Candidate ID**: `candidate-009`
- **Match Status**: `PARTIAL_MATCH`
- **Supporting Passage**: "Vaccines and immunization: Vaccine safety WHO  https://www.who.int/news-room/questions-and-answers/item/vaccines-and-immunization-vaccine-safety  1. Contribution of vaccination to improved survival and health: modelling 50 years of the Expanded Programme on Immunization. Shattock, Andrew J et al. The Lancet, Volume 403, Issue 10441, 2307 - 2316. https://www.thelancet.com/journals/lancet/article/PI"

### [T02] Vaccine safety continues to be monitored after vaccines are introduced.
- **Expected Verdict**: `TRUE`
- **Cited Source**: WHO – Vaccines and Immunization: &#10;Vaccine Safety
- **Matching Archive File**: `1. Curated Knowledge Base Document/01_Health_Misinformation/Myth Claims/2. PAHO/PAHO Health Misinformation.txt`
- **Candidate ID**: `candidate-002`
- **Match Status**: `PARTIAL_MATCH`
- **Supporting Passage**: "Title: Vaccines Cause Harm  Topic: Health Misinformation  Claim: Vaccination causes harm and is more dangerous than the diseases it prevents.  Verified Information: PAHO explains that misinformation suggesting vaccines are harmful can reduce public trust and vaccination uptake. Health workers should rely on evidence-based information, communicate transparently, and direct people to credible public"

### [T03] Most vaccine side effects are mild and temporary.
- **Expected Verdict**: `TRUE`
- **Cited Source**: WHO – Vaccines and Immunization: &#10;Vaccine Safety
- **Matching Archive File**: `1. Curated Knowledge Base Document/01_Health_Misinformation/Official Facts/2. PAHO/PAHO_Vaccine Safety/PAHO Vaccine Safety.txt`
- **Candidate ID**: `candidate-013`
- **Match Status**: `PARTIAL_MATCH`
- **Supporting Passage**: "Title: Stress-related reactions after vaccination are not always caused by the vaccine  Topic: Health Misinformation  Claim: Any physical reaction immediately after vaccination means the vaccine caused harm.  Verified Information: PAHO explains that some reactions occurring before, during, or immediately after vaccination are stress-related responses rather than effects caused by the vaccine itsel"

### [T04] Vaccination has saved millions of lives around the world.
- **Expected Verdict**: `TRUE`
- **Cited Source**: WHO – Vaccines and Immunization: &#10;Vaccine Safety
- **Matching Archive File**: `N/A`
- **Candidate ID**: `NO CANDIDATE`
- **Match Status**: `NO_MATCH`
- **Supporting Passage**: "N/A"

### [T05] Not every illness that occurs after vaccination is caused by the vaccine.
- **Expected Verdict**: `TRUE`
- **Cited Source**: PAHO – Manual for Surveillance of Events Supposedly Attributable to Vaccination or Immunization in the Region of the Americas
- **Matching Archive File**: `1. Curated Knowledge Base Document/01_Health_Misinformation/Myth Claims/2. PAHO/PAHO Health Misinformation.txt`
- **Candidate ID**: `candidate-002`
- **Match Status**: `PARTIAL_MATCH`
- **Supporting Passage**: "Title: Vaccines Cause Harm  Topic: Health Misinformation  Claim: Vaccination causes harm and is more dangerous than the diseases it prevents.  Verified Information: PAHO explains that misinformation suggesting vaccines are harmful can reduce public trust and vaccination uptake. Health workers should rely on evidence-based information, communicate transparently, and direct people to credible public"

### [T06] Adverse events following immunization should be investigated scientifically before determining their cause.
- **Expected Verdict**: `TRUE`
- **Cited Source**: PAHO – Manual for Surveillance of Events Supposedly Attributable to Vaccination or Immunization in the Region of the Americas
- **Matching Archive File**: `1. Curated Knowledge Base Document/01_Health_Misinformation/Myth Claims/2. PAHO/PAHO Health Misinformation.txt`
- **Candidate ID**: `candidate-002`
- **Match Status**: `PARTIAL_MATCH`
- **Supporting Passage**: "Title: Vaccines Cause Harm  Topic: Health Misinformation  Claim: Vaccination causes harm and is more dangerous than the diseases it prevents.  Verified Information: PAHO explains that misinformation suggesting vaccines are harmful can reduce public trust and vaccination uptake. Health workers should rely on evidence-based information, communicate transparently, and direct people to credible public"

### [T07] QDENGA vaccine recommendations depend on local dengue epidemiology.
- **Expected Verdict**: `TRUE`
- **Cited Source**: PAHO – Regional Guidelines for Dengue Vaccine Safety Surveillance: &#10;QDENGA (TAK-003)
- **Matching Archive File**: `1. Curated Knowledge Base Document/01_Health_Misinformation/Official Facts/2. PAHO/PAHO_Dengue/PAHO Dengue.txt`
- **Candidate ID**: `candidate-012`
- **Match Status**: `PARTIAL_MATCH`
- **Supporting Passage**: "Title: Adverse events following immunization require scientific investigation  Topic: Health Misinformation  Claim: Reports of adverse events alone prove that vaccines are unsafe.  Verified Information: PAHO states that reports of adverse events following immunization must be investigated systematically using epidemiological evidence and structured causality assessment. The timing of an event alon"

### [T08] Dengue vaccine safety should continue to be monitored after introduction.
- **Expected Verdict**: `TRUE`
- **Cited Source**: PAHO – Regional Guidelines for Dengue Vaccine Safety Surveillance: &#10;QDENGA (TAK-003)
- **Matching Archive File**: `1. Curated Knowledge Base Document/01_Health_Misinformation/Myth Claims/2. PAHO/PAHO Health Misinformation.txt`
- **Candidate ID**: `candidate-002`
- **Match Status**: `PARTIAL_MATCH`
- **Supporting Passage**: "Title: Vaccines Cause Harm  Topic: Health Misinformation  Claim: Vaccination causes harm and is more dangerous than the diseases it prevents.  Verified Information: PAHO explains that misinformation suggesting vaccines are harmful can reduce public trust and vaccination uptake. Health workers should rely on evidence-based information, communicate transparently, and direct people to credible public"

### [T09] Mental health is an essential part of overall health and well-being.
- **Expected Verdict**: `TRUE`
- **Cited Source**: WHO – Mental Health
- **Matching Archive File**: `1. Curated Knowledge Base Document/01_Health_Misinformation/Myth Claims/1. WHO/WHO_Mythbusters.txt`
- **Candidate ID**: `candidate-001`
- **Match Status**: `PARTIAL_MATCH`
- **Supporting Passage**: "Organization : WHO  Title : Coronavirus disease (COVID-19) advice for the public: Mythbusters  Type : Official Website  URL :  https://www.who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public/myth-busters  https://www.who.int/indonesia/news/novel-coronavirus/mythbusters  https://www.emro.who.int/health-topics/corona-virus/covid-19-myth-busters.html"

### [T10] Extreme heat can increase illness and the risk of premature death.
- **Expected Verdict**: `TRUE`
- **Cited Source**: WHO – Heat and Health
- **Matching Archive File**: `1. Curated Knowledge Base Document/01_Health_Misinformation/Official Facts/1. WHO/WHO_Heat Waves/WHO_Heat Waves.txt`
- **Candidate ID**: `candidate-006`
- **Match Status**: `PARTIAL_MATCH`
- **Supporting Passage**: "Title: Heatwaves can cause serious illness and death  Topic: Climate Misinformation  Claim: Heatwaves are only uncomfortable and do not pose serious health risks.  Verified Information: WHO states that heatwaves can significantly increase illness and mortality, particularly among older adults, infants, people with chronic diseases, and socially vulnerable populations. The risk increases during pro"

### [T11] Everyone has mental health, and it is important at every stage of life.
- **Expected Verdict**: `TRUE`
- **Cited Source**: WHO – Mental Health
- **Matching Archive File**: `1. Curated Knowledge Base Document/01_Health_Misinformation/Official Facts/1. WHO/WHO_Dengue/WHO Dengue.txt`
- **Candidate ID**: `candidate-004`
- **Match Status**: `PARTIAL_MATCH`
- **Supporting Passage**: "Title: Larval source management helps control mosquito-borne diseases  Topic: Health Misinformation  Claim: Mosquito populations cannot be effectively reduced by targeting their breeding sites.  Verified Information: According to WHO, larval source management (LSM) is an effective vector control approach that targets mosquito breeding habitats through environmental management, biological control, "

### [T12] Checking information with trusted sources helps reduce misinformation.
- **Expected Verdict**: `TRUE`
- **Cited Source**: UNESCO –
- **Matching Archive File**: `1. Curated Knowledge Base Document/01_Health_Misinformation/Myth Claims/2. PAHO/PAHO Health Misinformation.txt`
- **Candidate ID**: `candidate-002`
- **Match Status**: `PARTIAL_MATCH`
- **Supporting Passage**: "Title: Vaccines Cause Harm  Topic: Health Misinformation  Claim: Vaccination causes harm and is more dangerous than the diseases it prevents.  Verified Information: PAHO explains that misinformation suggesting vaccines are harmful can reduce public trust and vaccination uptake. Health workers should rely on evidence-based information, communicate transparently, and direct people to credible public"

### [Navigating the Infodemic with Media and Information Literacy (MIL)] T13
- **Expected Verdict**: `TRUE`
- **Cited Source**: UNESCO –
- **Matching Archive File**: `N/A`
- **Candidate ID**: `NO CANDIDATE`
- **Match Status**: `NO_MATCH`
- **Supporting Passage**: "N/A"

### [UNESCO explains that critical thinking and source evaluation are core competencies of Media and Information Literacy and help people distinguish reliable information from misinformation.] T14
- **Expected Verdict**: `TRUE`
- **Cited Source**: UNESCO –
- **Matching Archive File**: `N/A`
- **Candidate ID**: `NO CANDIDATE`
- **Match Status**: `NO_MATCH`
- **Supporting Passage**: "N/A"

### [UNESCO recommends evaluating the credibility, accuracy, and source of online information before accepting or sharing it.] Disaster Risk Reduction
- **Expected Verdict**: `TRUE`
- **Cited Source**: GADRRRES explains that children are active participants who can contribute valuable knowledge and skills to disaster risk reduction when meaningfully engaged.
- **Matching Archive File**: `N/A`
- **Candidate ID**: `NO CANDIDATE`
- **Match Status**: `NO_MATCH`
- **Supporting Passage**: "N/A"

### [GADRRRES –] Research into Action Brief: Child-centred Disaster Risk Reduction
- **Expected Verdict**: `TRUE`
- **Cited Source**: GADRRRES explains that children are active participants who can contribute valuable knowledge and skills to disaster risk reduction when meaningfully engaged.
- **Matching Archive File**: `1. Curated Knowledge Base Document/02_Disaster_Climate_Misinformtion/1. BNPB/BNPB.txt`
- **Candidate ID**: `candidate-014`
- **Match Status**: `PARTIAL_MATCH`
- **Supporting Passage**: "Title: Disaster Preparedness Requires More Than Physical Infrastructure  Topic: Disaster & Climate Misinformation  Claim: Building flood barriers alone is sufficient to ensure disaster preparedness.  Verified Information: Research on disaster preparedness in Bekasi shows that preparedness includes risk assessment, contingency planning, coordination systems, information sharing, public awareness, S"

### [Disaster risk reduction programmes should consider children's different needs and vulnerabilities.] GADRRRES recommends child-centred approaches that recognize differences in age, gender, disability, and social context when planning disaster risk reduction activities.
- **Expected Verdict**: `TRUE`
- **Cited Source**: Gender can influence children's experiences before, during, and after disasters.
- **Matching Archive File**: `1. Curated Knowledge Base Document/02_Disaster_Climate_Misinformtion/1. BNPB/BNPB.txt`
- **Candidate ID**: `candidate-014`
- **Match Status**: `PARTIAL_MATCH`
- **Supporting Passage**: "Title: Disaster Preparedness Requires More Than Physical Infrastructure  Topic: Disaster & Climate Misinformation  Claim: Building flood barriers alone is sufficient to ensure disaster preparedness.  Verified Information: Research on disaster preparedness in Bekasi shows that preparedness includes risk assessment, contingency planning, coordination systems, information sharing, public awareness, S"

### [GADRRRES explains that gender norms and inequalities influence children's exposure to risks, access to resources, and recovery after disasters.] GADRRRES –
- **Expected Verdict**: `TRUE`
- **Cited Source**: T18
- **Matching Archive File**: `N/A`
- **Candidate ID**: `NO CANDIDATE`
- **Match Status**: `NO_MATCH`
- **Supporting Passage**: "N/A"

### [Schools play an important role in disaster preparedness and resilience.] GADRRRES states that comprehensive school safety helps protect students, maintain learning continuity, and strengthen community resilience before, during, and after disasters.
- **Expected Verdict**: `TRUE`
- **Cited Source**: Research into Action Brief: Developing and Implementing Comprehensive School Safety
- **Matching Archive File**: `1. Curated Knowledge Base Document/01_Health_Misinformation/Official Facts/1. WHO/WHO_Heat Waves/WHO_Heat Waves.txt`
- **Candidate ID**: `candidate-006`
- **Match Status**: `PARTIAL_MATCH`
- **Supporting Passage**: "Title: Heatwaves can cause serious illness and death  Topic: Climate Misinformation  Claim: Heatwaves are only uncomfortable and do not pose serious health risks.  Verified Information: WHO states that heatwaves can significantly increase illness and mortality, particularly among older adults, infants, people with chronic diseases, and socially vulnerable populations. The risk increases during pro"

### [T19] GADRRRES explains that educational continuity following disasters contributes to children's protection, psychosocial well-being, and long-term recovery.
- **Expected Verdict**: `TRUE`
- **Cited Source**: Critical Factors for Educational Continuity
- **Matching Archive File**: `1. Curated Knowledge Base Document/02_Disaster_Climate_Misinformtion/2. GADRRRES/GADRESS.txt`
- **Candidate ID**: `candidate-015`
- **Match Status**: `PARTIAL_MATCH`
- **Supporting Passage**: "Title: Urban Floods Disrupt Educational Continuity  Topic: Disaster & Climate Misinformation  Claim: Schools can continue operating normally after urban floods without special planning.  Verified Information: Research shows that urban floods disrupt school infrastructure, learning activities, and access to education. Educational continuity requires preparedness, operational planning, and coordinat"

