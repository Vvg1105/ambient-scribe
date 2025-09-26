from typing import List
from schemas.rules import AntibioticFindings, RuleFinding
from schemas.rec import MedExtractionResult, RuleRecommendationList, RuleRecommendation
from openai import OpenAI
from dotenv import load_dotenv
import os
import logging
import json

load_dotenv()

system_prompt = """
You are a clinical assistant. Task: extract antibiotic GENERIC names present in the provided text.
- Output ONLY JSON: {"meds":[lowercase generic antibiotic names]}
- No prose. No markdown. If none, return {"meds":[]}
- Extract ANY antibiotic generic names mentioned in the text (not just from a specific list)
- Focus on antibiotics/antimicrobials, not other medications
- Use lowercase generic names only
- Examples of antibiotics: amoxicillin, azithromycin, ciprofloxacin, vancomycin, clindamycin, etc.
"""


def extract_meds_from_text(plan_text: str) -> list[str]:
    """
    Extracts medications from the plan text that is retrieved after SOAP extraction.
    """
    if not plan_text or not plan_text.strip():
        return []
    
    
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    schema = MedExtractionResult.model_json_schema() | {"additionalProperties": False}

    user_prompt = (
        "Plan text:\n"
        f"{plan_text}\n\n"
        "Return strictly this JSON object: {\"meds\": [\"...\"]}"
    )

    try:
        resp = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": "Example input:\nStart amoxicillin 500 mg TID and consider vancomycin if needed\nReturn strictly JSON: {\"meds\": [\"amoxicillin\", \"vancomycin\"]}"},
                {"role": "assistant", "content": "{\"meds\":[\"amoxicillin\", \"vancomycin\"]}"},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.0,
            response_format={"type": "json_object"},
            max_tokens=300,
            timeout=15,
        )

        raw = resp.choices[0].message.content
        logging.debug("LLM meds raw len=%d head=%.200s", len(raw or ""), raw or "")
        obj = json.loads(raw)  # raise if not valid JSON
        # Handle cases where model returns wrapped content
        if isinstance(obj, str):
            obj = json.loads(obj)
        meds = MedExtractionResult.model_validate(obj).meds
        # normalize + dedupe
        meds = sorted({m.strip().lower() for m in meds if isinstance(m, str) and m.strip()})
        logging.debug("LLM meds normalized: %s", meds)
        return meds
    
    except Exception as e:
        logging.error(f"Error extracting meds from text: {e}")
        return []


def generate_recommendations(findings_dict: dict) -> RuleRecommendationList:
    """
    Given deterministic findings, ask the LLM to explain and suggest alternatives.
    Never changes findings; only augments with rationale/alternatives.
    """
    try:
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        schema = RuleRecommendationList.model_json_schema()
        schema["additionalProperties"] = False

        payload = json.dumps(findings_dict, ensure_ascii=False)

        return_instr = 'Return: {"recommendations":[{"findingId":"...","reason":"...","alternatives":["..."]}]}'
        resp = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=[
                {"role": "system", "content": "Explain antibiotic safety findings and propose safe alternatives. JSON only."},
                {"role": "user", "content": f"Findings JSON:\n{payload}\n{return_instr}"},
            ],
            temperature=0.2,
            response_format={"type": "json_object"},
            max_tokens=250,
            timeout=15,
        )
        return RuleRecommendationList.model_validate_json(resp.choices[0].message.content)
    except Exception as e:
        logging.error(f"Error generating recommendations: {e}")
        return RuleRecommendationList(recommendations=[])


def check_antibiotics(meds: List[str], allergies: List[str]) -> AntibioticFindings:
    """
    Deterministic safety checks. Authoritative source of truth.
    Example rule: amoxicillin contraindicated in penicillin allergy.
    """
    def _normalize(values: List[str]) -> List[str]:
        return [v.strip().lower() for v in values if isinstance(v, str)]

    meds_n = set(_normalize(meds))
    allergies_n = set(_normalize(allergies))

    findings: List[RuleFinding] = []
    if "amoxicillin" in meds_n and "penicillin" in allergies_n:
        findings.append(
            RuleFinding(
                id="abx-penicillin-cross-reactivity",
                title="Penicillin allergy with amoxicillin",
                severity="high",
                details=(
                    "Patient has a documented penicillin allergy while amoxicillin is in the medication list. "
                    "Consider alternative therapy and verify allergy history."
                ),
            )
        )

    return AntibioticFindings(findings=findings)


def analyze_antibiotics(meds: List[str] | None, allergies: List[str], plan_text: str | None = None) -> dict:
    """
    Orchestrate extraction (if needed), deterministic checks, and LLM augmentation.
    Returns a combined dict suitable for WS or HTTP responses.
    """
    resolved_meds = meds or (extract_meds_from_text(plan_text or "") if plan_text else [])
    findings_obj = check_antibiotics(resolved_meds, allergies)
    recs = generate_recommendations(findings_obj.model_dump()) if findings_obj.findings else RuleRecommendationList(recommendations=[])

    return {
        "meds": resolved_meds,
        "findings": findings_obj.model_dump(),
        "recommendations": recs.model_dump(),
    }
