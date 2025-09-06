"""
This script is used to test the entire SOAP extraction pipeline including the LLM and manual extraction.
"""

from backend.services.soap_extractor import extract_soap_note
from backend.services.antibiotic_rules import extract_meds_from_text, analyze_antibiotics

# Sample medical transcript (like what you'd get from a doctor-patient conversation)
sample_transcript = """
Doctor: Good morning, how are you feeling today?
Patient: I've been having a really bad cough for the past week, and I'm having trouble breathing.
Doctor: I see. Any fever or chest pain?
Patient: Yes, I've had a fever of 101°F and my chest hurts when I cough.
Doctor: Let me listen to your lungs... I can hear some crackling sounds. 
Patient: Is it serious?
Doctor: It looks like you have pneumonia. I'm going to start you on ceftriaxone 1g IV daily for 7 days, and also azithromycin 500mg daily for atypical coverage. We'll also give you some pain medication.
Patient: Will that help?
Doctor: Yes, this should clear up the infection. Come back in 3 days for a follow-up.
"""

def test_complete_pipeline():
    """
    Test the complete pipeline including the SOAP extraction and antibiotic rules extraction.
    """
    print("🔄 TESTING COMPLETE SOAP → MEDICATION EXTRACTION WORKFLOW")
    print("=" * 70)

    # Step 1: Extract SOAP note from transcript
    print("\nStep 1: Extracting SOAP note from transcript...")
    soap_note = extract_soap_note(sample_transcript)

    print(f"Subjective: {soap_note.subjective}")
    print(f"Objective: {soap_note.objective}")
    print(f"Assessment: {soap_note.assessment}")
    print(f"Plan: {soap_note.plan}")

    # Step 2: Extract medications from SOAP note
    print("\nStep 2: Extracting medications from SOAP note...")
    extracted_meds = extract_meds_from_text(soap_note.plan)
    print(f"Medications: {extracted_meds}")

    # Step 3: Run full anitbiotic analysis
    print("\nStep 3: Running full antibiotic analysis...")
    result = analyze_antibiotics(
        meds=extracted_meds,
        allergies=["penicillin"],
        plan_text=soap_note.plan
    )

    print("\nRESULTS:")
    print(f"Final medications: {result['meds']}")
    print(f"Number of findings: {len(result['findings']['findings'])}")
    print(f"Number of recommendations: {len(result['recommendations']['recommendations'])}")

    # Show findings
    if result['findings']['findings']:
        print("\nSAFETY FINDINGS:")
        for finding in result['findings']['findings']:
            print(f"{finding['title']} (Severity: {finding['severity']})")
            print(f"{finding['details']}")
    
    return result

if __name__ == "__main__":
    result = test_complete_pipeline()